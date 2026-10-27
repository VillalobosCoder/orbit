import { and, asc, eq, max, min, sql } from "drizzle-orm";
import type {
  BoardColumnCategory,
  BoardColumnRequestDto,
  ProjectIdRequestDto,
} from "@orbit/shared";
import type {
  BoardColumnRepository,
  MoveColumnIssuesCommand,
  ReorderColumnsCommand,
} from "../../../application/board-column/ports/board-column-repository.port.js";
import { BoardColumn } from "../../../domain/board-column/board-column.entity.js";
import {
  BoardColumnNameAlreadyExistsError,
  BoardColumnNotFoundError,
} from "../../../domain/board-column/board-column.errors.js";
import type { DbContext } from "../db-context.js";
import { boardColumns } from "../schema/board-columns.js";
import { issues } from "../schema/issues.js";

const POSITION_STEP = 1024;

function isNameUniqueViolation(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    !("constraint" in error)
  ) {
    return false;
  }

  return (
    error.code === "23505" &&
    error.constraint === "board_columns_project_id_name_unique"
  );
}

export class DBBoardColumnRepository implements BoardColumnRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private toEntity(row: typeof boardColumns.$inferSelect): BoardColumn {
    return BoardColumn.fromPersistence({
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      category: row.category as BoardColumnCategory,
      position: row.position,
      color: row.color,
      wipLimit: row.wipLimit,
    });
  }

  async save(column: BoardColumn, actorUserId: number): Promise<number> {
    try {
      const [created] = await this.db
        .insert(boardColumns)
        .values({
          projectId: column.projectId,
          name: column.name,
          category: column.category,
          position: column.position,
          color: column.color,
          wipLimit: column.wipLimit,
          createdByUserId: actorUserId,
        })
        .returning({ id: boardColumns.id });

      return created.id;
    } catch (error) {
      if (isNameUniqueViolation(error)) {
        throw new BoardColumnNameAlreadyExistsError(column.name);
      }

      throw error;
    }
  }

  async findAllByProject({ id }: ProjectIdRequestDto): Promise<BoardColumn[]> {
    const rows = await this.db
      .select()
      .from(boardColumns)
      .where(eq(boardColumns.projectId, id))
      .orderBy(asc(boardColumns.position), asc(boardColumns.id));

    return rows.map((row) => this.toEntity(row));
  }

  async findById({
    id,
    columnId,
  }: BoardColumnRequestDto): Promise<BoardColumn | null> {
    const [row] = await this.db
      .select()
      .from(boardColumns)
      .where(
        and(eq(boardColumns.id, columnId), eq(boardColumns.projectId, id)),
      )
      .limit(1);

    return row ? this.toEntity(row) : null;
  }

  async update(column: BoardColumn, actorUserId: number): Promise<void> {
    try {
      const [row] = await this.db
        .update(boardColumns)
        .set({
          name: column.name,
          color: column.color,
          wipLimit: column.wipLimit,
          updatedAt: new Date(),
          updatedByUserId: actorUserId,
        })
        .where(
          and(
            eq(boardColumns.id, column.id!),
            eq(boardColumns.projectId, column.projectId),
          ),
        )
        .returning({ id: boardColumns.id });

      if (!row) {
        throw new BoardColumnNotFoundError(column.id!);
      }
    } catch (error) {
      if (isNameUniqueViolation(error)) {
        throw new BoardColumnNameAlreadyExistsError(column.name);
      }

      throw error;
    }
  }

  async reorder({
    id,
    columnIds,
    actorUserId,
  }: ReorderColumnsCommand): Promise<void> {
    for (const [position, columnId] of columnIds.entries()) {
      await this.db
        .update(boardColumns)
        .set({ position, updatedAt: new Date(), updatedByUserId: actorUserId })
        .where(
          and(eq(boardColumns.id, columnId), eq(boardColumns.projectId, id)),
        );
    }
  }

  async moveIssues({
    id,
    fromColumnId,
    toColumnId,
    toIsDone,
    actorUserId,
  }: MoveColumnIssuesCommand): Promise<void> {
    const [source] = await this.db
      .select({ first: min(issues.boardPosition) })
      .from(issues)
      .where(and(eq(issues.projectId, id), eq(issues.columnId, fromColumnId)));
    const [destination] = await this.db
      .select({ last: max(issues.boardPosition) })
      .from(issues)
      .where(and(eq(issues.projectId, id), eq(issues.columnId, toColumnId)));

    // Conservan su orden relativo y quedan después de los que ya estaban.
    const offset =
      (destination?.last ?? -POSITION_STEP) + POSITION_STEP - (source?.first ?? 0);

    await this.db
      .update(issues)
      .set({
        columnId: toColumnId,
        boardPosition: sql`${issues.boardPosition} + ${offset}`,
        resolvedAt: toIsDone ? sql`coalesce(${issues.resolvedAt}, now())` : null,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(and(eq(issues.projectId, id), eq(issues.columnId, fromColumnId)));
  }

  async delete({ id, columnId }: BoardColumnRequestDto): Promise<void> {
    const [row] = await this.db
      .delete(boardColumns)
      .where(and(eq(boardColumns.id, columnId), eq(boardColumns.projectId, id)))
      .returning({ id: boardColumns.id });

    if (!row) {
      throw new BoardColumnNotFoundError(columnId);
    }
  }
}
