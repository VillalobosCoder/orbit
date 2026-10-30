import { useState, type SubmitEvent } from "react";
import { ChevronDown, ChevronUp, CircleAlert, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ConfirmDialogComponent } from "@/shared/ui/custom-components/confirm-dialog-component";
import {
  BoardColumnCategory,
  type BoardColumnDto,
  type ProjectDto,
} from "@orbit/shared";
import { cn } from "cn";
import {
  useCreateBoardColumn,
  useDeleteBoardColumn,
  useReorderBoardColumns,
  useUpdateBoardColumn,
} from "../../api/columns-queries";

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
  const createColumn = useCreateBoardColumn();
  const reorderColumns = useReorderBoardColumns();
  const ordered = [...columns].sort(
    (a, b) => a.position - b.position || a.id - b.id,
  );
  const countIn = (category: BoardColumnCategory) =>
    ordered.filter((column) => column.category === category).length;

  function move(index: number, direction: -1 | 1) {
    const columnIds = ordered.map((column) => column.id);
    const target = index + direction;

    if (target < 0 || target >= columnIds.length) return;

    [columnIds[index], columnIds[target]] = [columnIds[target], columnIds[index]];
    reorderColumns.mutate({ id: project.id, columnIds });
  }

  function handleCreate(event: SubmitEvent<HTMLFormElement>) {
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

    createColumn.mutate(
      {
        id: project.id,
        name,
        category: category as BoardColumnCategory,
        wipLimit: wipLimit ? Number(wipLimit) : null,
      },
      { onSuccess: () => form.reset() },
    );
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Columnas del tablero</DialogTitle>
          <DialogDescription>
            Cada columna es un estado de {project.projectKey}. Debe quedar al
            menos una «Por hacer» y una «Finalizada». La categoría se elige al
            crearla y no cambia.
          </DialogDescription>
        </DialogHeader>

        {reorderColumns.isError && (
          <ErrorAlert>{reorderColumns.error.message}</ErrorAlert>
        )}

        <ul className="flex flex-col gap-3">
          {ordered.map((column, index) => (
            <ColumnRow
              key={column.id}
              project={project}
              column={column}
              others={ordered.filter((other) => other.id !== column.id)}
              isLastOfCategory={countIn(column.category) <= 1}
              canMoveUp={index > 0}
              canMoveDown={index < ordered.length - 1}
              onMove={(direction) => move(index, direction)}
            />
          ))}
        </ul>

        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 rounded-xl border border-dashed border-input p-4"
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
              <Label htmlFor="new-column-category" className="text-muted-foreground">
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
            <Button type="submit" size="lg" disabled={createColumn.isPending}>
              <Plus />
              {createColumn.isPending ? "Agregando..." : "Agregar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Los nombres son únicos por proyecto. El límite se guarda; aún no se
            aplica en el tablero.
          </p>
          {createColumn.isError && (
            <ErrorAlert>{createColumn.error.message}</ErrorAlert>
          )}
        </form>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ColumnRow({
  project,
  column,
  others,
  isLastOfCategory,
  canMoveUp,
  canMoveDown,
  onMove,
}: {
  project: ProjectDto;
  column: BoardColumnDto;
  others: BoardColumnDto[];
  /** La última «Por hacer» o «Finalizada» no se puede eliminar. */
  isLastOfCategory: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const updateColumn = useUpdateBoardColumn();
  const deleteColumn = useDeleteBoardColumn();
  const [targetId, setTargetId] = useState<number>(others[0]?.id ?? 0);
  const [isConfirming, setIsConfirming] = useState(false);
  const target = others.find((other) => other.id === targetId);
  const isProtected =
    column.category !== BoardColumnCategory.IN_PROGRESS && isLastOfCategory;

  function handleSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const wipLimit = formData.get("wipLimit");

    if (typeof name !== "string" || typeof wipLimit !== "string") return;

    updateColumn.mutate({
      id: project.id,
      columnId: column.id,
      name,
      color: column.color,
      wipLimit: wipLimit ? Number(wipLimit) : null,
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
      <form
        onSubmit={handleSave}
        className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto_7rem_auto]"
      >
        <span className="flex flex-col gap-0.5">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            disabled={!canMoveUp}
            aria-label={`Subir ${column.name}`}
            onClick={() => onMove(-1)}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            disabled={!canMoveDown}
            aria-label={`Bajar ${column.name}`}
            onClick={() => onMove(1)}
          >
            <ChevronDown />
          </Button>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "size-2.5 rounded-full",
            !column.color && CATEGORY_DOT[column.category],
          )}
          style={column.color ? { backgroundColor: column.color } : undefined}
        />
        <Input
          name="name"
          aria-label="Nombre de la columna"
          defaultValue={column.name}
          maxLength={50}
          required
        />
        <Badge className="max-sm:col-start-3 max-sm:justify-self-start">
          {CATEGORY_LABELS[column.category]}
        </Badge>
        <Input
          name="wipLimit"
          type="number"
          aria-label="Límite de trabajo en curso"
          min={1}
          max={1000}
          defaultValue={column.wipLimit ?? ""}
          placeholder="Sin límite"
          className="max-sm:col-start-3"
        />
        <Button
          type="submit"
          variant="outline"
          className="max-sm:col-start-3 max-sm:justify-self-start"
          disabled={updateColumn.isPending}
        >
          {updateColumn.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2.5 pl-1 text-sm text-muted-foreground">
        {isProtected ? (
          <p>
            Es la única columna «{CATEGORY_LABELS[column.category]}»: no se puede
            eliminar.
          </p>
        ) : (
          <>
            <label htmlFor={`target-${column.id}`}>
              Al eliminar, mover issues a
            </label>
            <NativeSelect
              id={`target-${column.id}`}
              className="h-8 w-44 text-[0.8125rem]"
              value={targetId}
              onChange={(event) => setTargetId(Number(event.currentTarget.value))}
            >
              {others.map((other) => (
                <option key={other.id} value={other.id}>
                  {other.name}
                </option>
              ))}
            </NativeSelect>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteColumn.isPending || !target}
              onClick={() => setIsConfirming(true)}
            >
              Eliminar
            </Button>
          </>
        )}
      </div>

      {updateColumn.isError && (
        <ErrorAlert>{updateColumn.error.message}</ErrorAlert>
      )}
      {deleteColumn.isError && (
        <ErrorAlert>{deleteColumn.error.message}</ErrorAlert>
      )}

      <ConfirmDialogComponent
        open={isConfirming}
        title={`¿Eliminar «${column.name}»?`}
        description={`Sus issues pasarán a «${target?.name}».`}
        confirmLabel="Eliminar columna"
        pendingLabel="Eliminando..."
        isPending={deleteColumn.isPending}
        destructive
        onClose={() => setIsConfirming(false)}
        onConfirm={() => {
          if (!target) return;
          deleteColumn.mutate(
            {
              id: project.id,
              columnId: column.id,
              moveIssuesToColumnId: target.id,
            },
            { onSettled: () => setIsConfirming(false) },
          );
        }}
      />
    </li>
  );
}
