import { useState, type SubmitEvent } from "react";
import { Plus } from "lucide-react";

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
import {
  useApplyBoardColumnChanges,
  type ColumnChangePlan,
} from "../api/columns-queries";
import { boardKey } from "../api/queries";
import { useI18n } from "@/i18n/use-i18n";
import { notifyError } from "@/notifications/notify";
import ColumnRow from "./components/board-columns-dialog/board-column-row";
import {
  normalizeName,
  sortColumns,
  toDraft,
  type DraftColumn,
  type Deletion,
} from "./components/board-columns-dialog/board-columns-draft";

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
  }>({ columns, version: 0 });

  return (
    <ColumnsEditor
      key={session.version}
      project={project}
      columns={session.columns}
      onClose={onClose}
      onFailed={(freshColumns) =>
        setSession((current) => ({
          columns: freshColumns,
          version: current.version + 1,
        }))
      }
    />
  );
}

function ColumnsEditor({
  project,
  columns,
  onClose,
  onFailed,
}: BoardColumnsDialogProps & {
  onFailed: (columns: BoardColumnDto[]) => void;
}) {
  const { t } = useI18n();
  const applyChanges = useApplyBoardColumnChanges();
  const [originalColumns] = useState(() => sortColumns(columns));
  const [drafts, setDrafts] = useState<DraftColumn[]>(() =>
    originalColumns.map(toDraft),
  );
  const [deletions, setDeletions] = useState<Deletion[]>([]);
  const [newColumnCount, setNewColumnCount] = useState(0);
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

    if (!normalized) return t("issues.columns.nameEmpty");
    if ((nameCounts.get(normalized) ?? 0) > 1) {
      return t("issues.columns.nameDuplicate");
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
      notifyError(t("issues.columns.formDuplicate"));
      return;
    }

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

    try {
      await applyChanges.mutateAsync(plan);
      onClose();
    } catch {
      const freshBoard = queryClient.getQueryData<BoardDto>(
        boardKey(project.id),
      );

      if (freshBoard) {
        onFailed(freshBoard.columns);
        notifyError(t("issues.columns.partialSaved"));
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
          <DialogTitle>{t("issues.columns.title")}</DialogTitle>
          <DialogDescription>
            {t("issues.columns.description", { key: project.projectKey })}
          </DialogDescription>
        </DialogHeader>

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
          <h3 className="text-sm font-semibold">
            {t("issues.columns.add")}
          </h3>
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_7rem_auto]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-column-name" className="text-muted-foreground">
                {t("common.name")}
              </Label>
              <Input
                id="new-column-name"
                name="name"
                placeholder={t("issues.columns.namePlaceholder")}
                maxLength={50}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="new-column-category"
                className="text-muted-foreground"
              >
                {t("issues.columns.category")}
              </Label>
              <NativeSelect
                id="new-column-category"
                name="category"
                defaultValue={BoardColumnCategory.IN_PROGRESS}
              >
                {Object.values(BoardColumnCategory).map((category) => (
                  <option key={category} value={category}>
                    {t(`issues.categories.${category}`)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-column-limit" className="text-muted-foreground">
                {t("issues.columns.wipLimit")}
              </Label>
              <Input
                id="new-column-limit"
                name="wipLimit"
                type="number"
                min={1}
                max={1000}
                placeholder={t("issues.columns.wipPlaceholder")}
              />
            </div>
            <Button type="submit" size="lg" disabled={applyChanges.isPending}>
              <Plus />
              {t("common.add")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("issues.columns.addHint")}
          </p>
        </form>

        <DialogFooter className="shrink-0 items-center">
          <span className="text-xs text-muted-foreground sm:mr-auto">
            {isDirty ? t("issues.columns.pendingChanges") : ""}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={applyChanges.isPending}
            onClick={requestClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            loading={applyChanges.isPending}
            disabled={hasErrors}
            onClick={() => void handleApply()}
          >
            {t("issues.columns.done")}
          </Button>
        </DialogFooter>

        <ConfirmDialogComponent
          open={isConfirmingDiscard}
          title={t("issues.columns.discard.title")}
          description={t("issues.columns.discard.description")}
          confirmLabel={t("issues.columns.discard.confirm")}
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
