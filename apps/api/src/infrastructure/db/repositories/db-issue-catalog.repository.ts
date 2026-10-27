import { asc, eq, isNull, or } from "drizzle-orm";
import {
  DEFAULT_BOARD_COLUMNS,
  DEFAULT_ISSUE_TYPES,
  type BoardColumnCategory,
  type BoardColumnDto,
  type DifficultyDto,
  type IssueTypeDto,
  type PriorityDto,
  type ProjectIdRequestDto,
} from "@orbit/shared";
import type {
  IssueCatalogRepository,
  SeedDefaultCatalogCommand,
} from "../../../application/issue/ports/issue-catalog-repository.port.js";
import type { DbContext } from "../db-context.js";
import { boardColumns } from "../schema/board-columns.js";
import { difficulties } from "../schema/difficulties.js";
import { issueTypes } from "../schema/issue-types.js";
import { priorities } from "../schema/priorities.js";

export class DBIssueCatalogRepository implements IssueCatalogRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  async findColumns({ id }: ProjectIdRequestDto): Promise<BoardColumnDto[]> {
    const rows = await this.db
      .select({
        id: boardColumns.id,
        name: boardColumns.name,
        category: boardColumns.category,
        position: boardColumns.position,
        color: boardColumns.color,
        wipLimit: boardColumns.wipLimit,
      })
      .from(boardColumns)
      .where(eq(boardColumns.projectId, id))
      .orderBy(asc(boardColumns.position), asc(boardColumns.id));

    return rows.map((row) => ({
      ...row,
      category: row.category as BoardColumnCategory,
    }));
  }

  findIssueTypes({ id }: ProjectIdRequestDto): Promise<IssueTypeDto[]> {
    return this.db
      .select({
        id: issueTypes.id,
        name: issueTypes.name,
        isSubtask: issueTypes.isSubtask,
        icon: issueTypes.icon,
      })
      .from(issueTypes)
      .where(eq(issueTypes.projectId, id))
      .orderBy(asc(issueTypes.id));
  }

  findPriorities({ id }: ProjectIdRequestDto): Promise<PriorityDto[]> {
    return this.db
      .select({
        id: priorities.id,
        name: priorities.name,
        level: priorities.level,
        color: priorities.color,
      })
      .from(priorities)
      .where(or(isNull(priorities.projectId), eq(priorities.projectId, id)))
      .orderBy(asc(priorities.level), asc(priorities.id));
  }

  findDifficulties(): Promise<DifficultyDto[]> {
    return this.db
      .select({
        id: difficulties.id,
        name: difficulties.name,
        level: difficulties.level,
      })
      .from(difficulties)
      .orderBy(asc(difficulties.level), asc(difficulties.id));
  }

  async seedDefaults({
    id,
    actorUserId,
  }: SeedDefaultCatalogCommand): Promise<void> {
    await this.db.insert(boardColumns).values(
      DEFAULT_BOARD_COLUMNS.map((column) => ({
        projectId: id,
        name: column.name,
        category: column.category,
        position: column.position,
        createdByUserId: actorUserId,
      })),
    );
    await this.db.insert(issueTypes).values(
      DEFAULT_ISSUE_TYPES.map((type) => ({
        projectId: id,
        name: type.name,
        icon: type.icon,
        isSubtask: type.isSubtask,
        createdByUserId: actorUserId,
      })),
    );
  }
}
