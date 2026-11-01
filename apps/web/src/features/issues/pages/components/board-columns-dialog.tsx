import { useState, type SubmitEvent } from "react";
import { ChevronDown, ChevronUp, CircleAlert, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { queryClient } from "@/api/tanstack-query-config";
import {
  BoardColumnCategory,
  type BoardColumnDto,
  type BoardDto,
  type ProjectDto,
} from "@orbit/shared";
import { cn } from "cn";
import {
  useApplyBoardColumnChanges,
  type ColumnChangePlan,
} from "../../api/columns-queries";
import { boardKey } from "../../api/queries";

const CATEGORY_LABELS: Record<BoardColumnCategory, string> = {
  [BoardColumnCategory.TODO]: "Por hacer",
  [BoardColumnCategory.IN_PROGRESS]: "En curso",
  [BoardColumnCategory.DONE]: "Finalizada",
};

const CATEGORY_DOT: Record<BoardColumnCategory, string> = {
  [BoardColumnCategory.TODO]: "bg-muted-foreground",
  [BoardColumnCategory.IN_PROGRESS]: "bg-primary",
  [BoardColumnCategory.DONE]: "bg-success",
};

type DraftColumn = {
  key: string;
  id: number | null;
  name: string;
  color: string | null;
  category: BoardColumnCategory;
  wipLimit: number | null;
};

type Deletion = { id: number; moveToId: number };

function toDraft(column: BoardColumnDto): DraftColumn {
  return {
    key: `column-${column.id}`,
    id: column.id,
    name: column.name,
    color: column.color,
    category: column.category,
    wipLimit: column.wipLimit,
  };
}

function sortColumns(columns: BoardColumnDto[]) {
  return [...columns].sort((a, b) => a.position - b.position || a.id - b.id);
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function ErrorAlert({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

interface BoardColumnsDialogProps {
  project: ProjectDto;
  columns: BoardColumnDto[];
  onClose: () => void;
}

export default function BoardColumnsDialog({
  project,
  columns,
  onClose,
}: BoardColumnsDialogProps) {
  const [session, setSession] = useState<{
    columns: BoardColumnDto[];
    version: number;
    error: string | null;
  }>({ columns, version: 0, error: null });

  return (
    <ColumnsEditor
      key={session.version}
      project={project}
      columns={session.columns}
      initialError={session.error}
      onClose={onClose}
      onFailed={(freshColumns, message) =>
        setSession((current) => ({
          columns: freshColumns,
          version: current.version + 1,
          error: message,
        }))
      }
    />
  );
}

function ColumnsEditor({
  project,
  columns,
  initialError,
  onClose,
  onFailed,
}: BoardColumnsDialogProps & {
  initialError: string | null;
  onFailed: (columns: BoardColumnDto[], message: string) => void;
}) {
  const applyChanges = useApplyBoardColumnChanges();
  const [originalColumns] = useState(() => sortColumns(columns));
  const [drafts, setDrafts] = useState<DraftColumn[]>(() =>
    originalColumns.map(toDraft),
  );
  const [deletions, setDeletions] = useState<Deletion[]>([]);
  const [newColumnCount, setNewColumnCount] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(initialError);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  const originalById = new Map(
    originalColumns.map((column) => [column.id, column]),
  );
  const survivors = drafts.filter((draft) => draft.id !== null);
  const creations = drafts.filter((draft) => draft.id === null);
  const deletedIds = new Set(deletions.map((deletion) => deletion.id));
  const keptOriginalIds = originalColumns
    .filter((column) => !deletedIds.has(column.id))
    .map((column) => column.id);
  const orderChanged = survivors.some(
    (draft, index) => draft.id !== keptOriginalIds[index],
  );
  const canonicalKeys = [...survivors, ...creations].map((draft) => draft.key);
  const interleaved = drafts.some(
    (draft, index) => draft.key !== canonicalKeys[index],
  );
  const updates = survivors.filter((draft) => {
    const original = originalById.get(draft.id!);

    return (
      original !== undefined &&
      (original.name !== draft.name.trim() ||
        original.wipLimit !== draft.wipLimit)
    );
  });
  const isDirty =
    deletions.length > 0 ||
    creations.length > 0 ||
    updates.length > 0 ||
    orderChanged;

  const nameCounts = new Map<string, number>();
  drafts.forEach((draft) => {
    const normalized = normalizeName(draft.name);
    nameCounts.set(normalized, (nameCounts.get(normalized) ?? 0) + 1);
  });
  const nameErrorOf = (draft: DraftColumn) => {
    const normalized = normalizeName(draft.name);

    if (!normalized) return "Escribe un nombre.";
    if ((nameCounts.get(normalized) ?? 0) > 1) {
      return "Ya hay otra columna con este nombre.";
    }

    return null;
  };
  const hasErrors = drafts.some((draft) => nameErrorOf(draft) !== null);
  const survivorsIn = (category: BoardColumnCategory) =>
    survivors.filter((draft) => draft.category === category).length;

  function changeDraft(key: string, changes: Partial<DraftColumn>) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === key ? { ...draft, ...changes } : draft,
      ),
    );
  }

  function moveDraft(index: number, direction: -1 | 1) {
    setDrafts((current) => {
      const target = index + direction;

      if (target < 0 || target >= current.length) return current;

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });
  }

  function removeDraft(draft: DraftColumn, moveToId?: number) {
    if (draft.id !== null && moveToId !== undefined) {
      setDeletions((current) => [...current, { id: draft.id!, moveToId }]);
    }

    setDrafts((current) => current.filter((item) => item.key !== draft.key));
  }

  function handleAdd(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name");
    const category = formData.get("category");
    const wipLimit = formData.get("wipLimit");

    if (
      typeof name !== "string" ||
      typeof category !== "string" ||
      typeof wipLimit !== "string"
    ) {
      return;
    }

    if (
      drafts.some((draft) => normalizeName(draft.name) === normalizeName(name))
    ) {
      setFormError("Ya hay una columna con este nombre.");
      return;
    }

    setFormError(null);
    setDrafts((current) => [
      ...current,
      {
        key: `new-${newColumnCount}`,
        id: null,
        name: name.trim(),
        color: null,
        category: category as BoardColumnCategory,
        wipLimit: wipLimit ? Number(wipLimit) : null,
      },
    ]);
    setNewColumnCount((count) => count + 1);
    form.reset();
  }

  async function handleApply() {
    if (!isDirty) {
      onClose();
      return;
    }

    const moveTargets = new Map(
      deletions.map((deletion) => [deletion.id, deletion.moveToId]),
    );
    const survivingTarget = (columnId: number) => {
      let target = columnId;

      while (moveTargets.has(target)) {
        target = moveTargets.get(target)!;
      }

      return target;
    };
    const plan: ColumnChangePlan = {
      projectId: project.id,
      deletions: deletions.map((deletion) => ({
        columnId: deletion.id,
        moveIssuesToColumnId: survivingTarget(deletion.moveToId),
      })),
      updates: updates.map((draft) => ({
        columnId: draft.id!,
        name: draft.name.trim(),
        color: draft.color,
        wipLimit: draft.wipLimit,
      })),
      creations: creations.map((draft) => ({
        key: draft.key,
        payload: {
          name: draft.name.trim(),
          category: draft.category,
          wipLimit: draft.wipLimit,
        },
      })),
      finalOrder: drafts.map((draft) => draft.id ?? draft.key),
      reorder: orderChanged || interleaved,
    };

    setApplyError(null);

    try {
      await applyChanges.mutateAsync(plan);
      onClose();
    } catch (error) {
      const freshBoard = queryClient.getQueryData<BoardDto>(
        boardKey(project.id),
      );
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron aplicar los cambios.";

      if (freshBoard) {
        onFailed(
          freshBoard.columns,
          `${message} Los cambios anteriores a este error sí se guardaron; revisa la lista y vuelve a intentarlo.`,
        );
      } else {
        setApplyError(message);
      }
    }
  }

  function requestClose() {
    if (applyChanges.isPending) return;

    if (isDirty) {
      setIsConfirmingDiscard(true);
      return;
    }

    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) requestClose();
      }}
    >
      <DialogContent className="flex h-[min(90vh,46rem)] flex-col gap-4 overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Columnas del tablero</DialogTitle>
          <DialogDescription>
            Cada columna es un estado de {project.projectKey}. Debe quedar al
            menos una «Por hacer» y una «Finalizada». La categoría se elige al
            crearla y no cambia. Los cambios se aplican al pulsar «Listo».
          </DialogDescription>
        </DialogHeader>

        {applyError && (
          <div className="shrink-0">
            <ErrorAlert>{applyError}</ErrorAlert>
          </div>
        )}

        <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {drafts.map((draft, index) => {
            const isProtected =
              draft.id !== null &&
              draft.category !== BoardColumnCategory.IN_PROGRESS &&
              survivorsIn(draft.category) <= 1;

            return (
              <ColumnRow
                key={draft.key}
                draft={draft}
                nameError={nameErrorOf(draft)}
                isProtected={isProtected}
                targets={survivors.filter((item) => item.key !== draft.key)}
                canMoveUp={index > 0}
                canMoveDown={index < drafts.length - 1}
                disabled={applyChanges.isPending}
                onChange={(changes) => changeDraft(draft.key, changes)}
                onMove={(direction) => moveDraft(index, direction)}
                onRemove={(moveToId) => removeDraft(draft, moveToId)}
              />
            );
          })}
        </ul>

        <form
          onSubmit={handleAdd}
          className="flex shrink-0 flex-col gap-3 rounded-xl border border-dashed border-input p-4"
        >
          <h3 className="text-sm font-semibold">Agregar columna</h3>
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_7rem_auto]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-column-name" className="text-muted-foreground">
                Nombre
              </Label>
              <Input
                id="new-column-name"
                name="name"
                placeholder="Ej. En pruebas"
                maxLength={50}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="new-column-category"
                className="text-muted-foreground"
              >
                Categoría
              </Label>
              <NativeSelect
                id="new-column-category"
                name="category"
                defaultValue={BoardColumnCategory.IN_PROGRESS}
              >
                {Object.values(BoardColumnCategory).map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-column-limit" className="text-muted-foreground">
                Límite WIP
              </Label>
              <Input
                id="new-column-limit"
                name="wipLimit"
                type="number"
                min={1}
                max={1000}
                placeholder="Opcional"
              />
            </div>
            <Button type="submit" size="lg" disabled={applyChanges.isPending}>
              <Plus />
              Agregar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Los nombres son únicos por proyecto. El límite se guarda; aún no se
            aplica en el tablero.
          </p>
          {formError && <ErrorAlert>{formError}</ErrorAlert>}
        </form>

        <DialogFooter className="shrink-0 items-center">
          <span className="text-xs text-muted-foreground sm:mr-auto">
            {isDirty ? "Tienes cambios sin aplicar." : ""}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={applyChanges.isPending}
            onClick={requestClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={applyChanges.isPending || hasErrors}
            onClick={() => void handleApply()}
          >
            {applyChanges.isPending ? "Aplicando..." : "Listo"}
          </Button>
        </DialogFooter>

        <ConfirmDialogComponent
          open={isConfirmingDiscard}
          title="¿Descartar los cambios?"
          description="Las columnas no se modificarán y perderás los cambios que hiciste en esta ventana."
          confirmLabel="Descartar cambios"
          pendingLabel="Descartando..."
          isPending={false}
          destructive
          onClose={() => setIsConfirmingDiscard(false)}
          onConfirm={() => {
            setIsConfirmingDiscard(false);
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function ColumnRow({
  draft,
  nameError,
  isProtected,
  targets,
  canMoveUp,
  canMoveDown,
  disabled,
  onChange,
  onMove,
  onRemove,
}: {
  draft: DraftColumn;
  nameError: string | null;
  /** La última «Por hacer» o «Finalizada» existente no se puede eliminar. */
  isProtected: boolean;
  targets: DraftColumn[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
  onChange: (changes: Partial<DraftColumn>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: (moveToId?: number) => void;
}) {
  const existingTargets = targets.filter((target) => target.id !== null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const selectedTarget =
    existingTargets.find((target) => target.id === targetId) ??
    existingTargets[0];

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto_7rem]">
        <span className="flex flex-col gap-0.5">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            disabled={!canMoveUp || disabled}
            aria-label={`Subir ${draft.name}`}
            onClick={() => onMove(-1)}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            disabled={!canMoveDown || disabled}
            aria-label={`Bajar ${draft.name}`}
            onClick={() => onMove(1)}
          >
            <ChevronDown />
          </Button>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "size-2.5 rounded-full",
            !draft.color && CATEGORY_DOT[draft.category],
          )}
          style={draft.color ? { backgroundColor: draft.color } : undefined}
        />
        <Input
          aria-label="Nombre de la columna"
          aria-invalid={nameError ? true : undefined}
          value={draft.name}
          maxLength={50}
          disabled={disabled}
          onChange={(event) => onChange({ name: event.currentTarget.value })}
        />
        <Badge className="max-sm:col-start-3 max-sm:justify-self-start">
          {draft.id === null
            ? `${CATEGORY_LABELS[draft.category]} · nueva`
            : CATEGORY_LABELS[draft.category]}
        </Badge>
        <Input
          type="number"
          aria-label="Límite de trabajo en curso"
          min={1}
          max={1000}
          value={draft.wipLimit ?? ""}
          placeholder="Sin límite"
          disabled={disabled}
          className="max-sm:col-start-3"
          onChange={(event) =>
            onChange({
              wipLimit: event.currentTarget.value
                ? Number(event.currentTarget.value)
                : null,
            })
          }
        />
      </div>

      {nameError && (
        <p className="pl-1 text-xs text-destructive">{nameError}</p>
      )}

      <div className="flex flex-wrap items-center gap-2.5 pl-1 text-sm text-muted-foreground">
        {draft.id === null ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onRemove()}
          >
            Quitar
          </Button>
        ) : isProtected ? (
          <p>
            Es la única columna «{CATEGORY_LABELS[draft.category]}»: no se
            puede eliminar.
          </p>
        ) : (
          <>
            <label htmlFor={`target-${draft.key}`}>
              Al eliminar, mover issues a
            </label>
            <NativeSelect
              id={`target-${draft.key}`}
              className="h-8 w-44 text-[0.8125rem]"
              value={selectedTarget?.id ?? ""}
              disabled={disabled}
              onChange={(event) =>
                setTargetId(Number(event.currentTarget.value))
              }
            >
              {existingTargets.map((target) => (
                <option key={target.key} value={target.id!}>
                  {target.name}
                </option>
              ))}
            </NativeSelect>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={disabled || !selectedTarget}
              onClick={() => selectedTarget && onRemove(selectedTarget.id!)}
            >
              Eliminar
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
