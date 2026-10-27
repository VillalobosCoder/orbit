import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BoardColumnCategory,
  type BoardColumnDto,
  type ProjectDto,
} from "@orbit/shared";
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Columnas del tablero</DialogTitle>
          <DialogDescription>
            Renombra, reordena o elimina las columnas de {project.projectKey}.
            La categoría se elige al crearla y no cambia.
          </DialogDescription>
        </DialogHeader>
        {reorderColumns.isError && (
          <p role="alert">{reorderColumns.error.message}</p>
        )}
        <ul className="space-y-2">
          {ordered.map((column, index) => (
            <ColumnRow
              key={column.id}
              project={project}
              column={column}
              others={ordered.filter((other) => other.id !== column.id)}
              canMoveUp={index > 0}
              canMoveDown={index < ordered.length - 1}
              onMove={(direction) => move(index, direction)}
            />
          ))}
        </ul>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <Input name="name" placeholder="Nueva columna" maxLength={50} required />
          <select name="category" defaultValue={BoardColumnCategory.IN_PROGRESS}>
            {Object.values(BoardColumnCategory).map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          <Input
            name="wipLimit"
            type="number"
            min={1}
            max={1000}
            placeholder="Límite"
            className="w-24"
          />
          <Button type="submit" disabled={createColumn.isPending}>
            {createColumn.isPending ? "Agregando..." : "Agregar"}
          </Button>
        </form>
        {createColumn.isError && (
          <p role="alert">{createColumn.error.message}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ColumnRow({
  project,
  column,
  others,
  canMoveUp,
  canMoveDown,
  onMove,
}: {
  project: ProjectDto;
  column: BoardColumnDto;
  others: BoardColumnDto[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const updateColumn = useUpdateBoardColumn();
  const deleteColumn = useDeleteBoardColumn();
  const [targetId, setTargetId] = useState<number>(others[0]?.id ?? 0);

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

  function handleDelete() {
    const target = others.find((other) => other.id === targetId);

    if (
      target &&
      window.confirm(
        `¿Eliminar "${column.name}"? Sus issues pasarán a "${target.name}".`,
      )
    ) {
      deleteColumn.mutate({
        id: project.id,
        columnId: column.id,
        moveIssuesToColumnId: target.id,
      });
    }
  }

  return (
    <li className="rounded-md border border-border p-2">
      <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2">
        <Input
          name="name"
          defaultValue={column.name}
          maxLength={50}
          required
          className="w-48"
        />
        <span className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[column.category]}
        </span>
        <Input
          name="wipLimit"
          type="number"
          min={1}
          max={1000}
          defaultValue={column.wipLimit ?? ""}
          placeholder="Límite"
          className="w-24"
        />
        <Button type="submit" variant="outline" disabled={updateColumn.isPending}>
          Guardar
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canMoveUp}
          aria-label={`Subir ${column.name}`}
          onClick={() => onMove(-1)}
        >
          ↑
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canMoveDown}
          aria-label={`Bajar ${column.name}`}
          onClick={() => onMove(1)}
        >
          ↓
        </Button>
      </form>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <label htmlFor={`target-${column.id}`}>Al eliminar, mover issues a</label>
        <select
          id={`target-${column.id}`}
          value={targetId}
          onChange={(event) => setTargetId(Number(event.currentTarget.value))}
        >
          {others.map((other) => (
            <option key={other.id} value={other.id}>
              {other.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="destructive"
          disabled={deleteColumn.isPending}
          onClick={handleDelete}
        >
          Eliminar
        </Button>
      </div>
      {updateColumn.isError && <p role="alert">{updateColumn.error.message}</p>}
      {deleteColumn.isError && <p role="alert">{deleteColumn.error.message}</p>}
    </li>
  );
}
