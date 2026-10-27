import { and, asc, eq, inArray, max, ne } from "drizzle-orm";
import {
  IssueStatusKey,
  StatusTypeKey,
  type IssueRequestDto,
  type ProjectIdRequestDto,
} from "@orbit/shared";
import type {
  DeleteIssueCommand,
  FindLastBoardPositionQuery,
  IssueRepository,
  ReplaceAssigneesCommand,
} from "../../../application/issue/ports/issue-repository.port.js";
import { Issue } from "../../../domain/issue/issue.entity.js";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import type { DbContext } from "../db-context.js";
import { issueAssignees } from "../schema/issue-assignees.js";
import { issues } from "../schema/issues.js";
import { findStatusId } from "./find-status-id.js";

export class DBIssueRepository implements IssueRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private getStatusId(statusKey: string): Promise<number> {
    return findStatusId(this.db, StatusTypeKey.ISSUE, statusKey);
  }

  private async findAssigneeIds(
    issueIds: number[],
  ): Promise<Map<number, number[]>> {
    const byIssue = new Map<number, number[]>();

    if (issueIds.length === 0) {
      return byIssue;
    }

    const rows = await this.db
      .select({ issueId: issueAssignees.issueId, userId: issueAssignees.userId })
      .from(issueAssignees)
      .where(inArray(issueAssignees.issueId, issueIds))
      .orderBy(asc(issueAssignees.assignedAt), asc(issueAssignees.userId));

    for (const { issueId, userId } of rows) {
      byIssue.set(issueId, [...(byIssue.get(issueId) ?? []), userId]);
    }

    return byIssue;
  }

  private toEntity(
    row: typeof issues.$inferSelect,
    assigneeIds: number[],
  ): Issue {
    return Issue.fromPersistence({
      id: row.id,
      projectId: row.projectId,
      issueNumber: row.issueNumber,
      typeId: row.typeId,
      priorityId: row.priorityId,
      difficultyId: row.difficultyId,
      parentId: row.parentId,
      columnId: row.columnId,
      reporterId: row.reporterId,
      title: row.title,
      description: row.description,
      boardPosition: row.boardPosition,
      resolvedAt: row.resolvedAt,
      assigneeIds,
    });
  }

  async save(issue: Issue, actorUserId: number): Promise<number> {
    const activeStatusId = await this.getStatusId(IssueStatusKey.ACTIVE);
    const [created] = await this.db
      .insert(issues)
      .values({
        projectId: issue.projectId,
        statusId: activeStatusId,
        issueNumber: issue.issueNumber,
        typeId: issue.typeId,
        columnId: issue.columnId,
        priorityId: issue.priorityId,
        difficultyId: issue.difficultyId,
        parentId: issue.parentId,
        reporterId: issue.reporterId,
        title: issue.title,
        description: issue.description,
        boardPosition: issue.boardPosition,
        resolvedAt: issue.resolvedAt,
        createdByUserId: actorUserId,
      })
      .returning({ id: issues.id });

    return created.id;
  }

  async findAllByProject({ id }: ProjectIdRequestDto): Promise<Issue[]> {
    const deletedStatusId = await this.getStatusId(IssueStatusKey.DELETED);
    const rows = await this.db
      .select()
      .from(issues)
      .where(and(eq(issues.projectId, id), ne(issues.statusId, deletedStatusId)))
      .orderBy(asc(issues.columnId), asc(issues.boardPosition), asc(issues.id));
    const assignees = await this.findAssigneeIds(rows.map((row) => row.id));

    return rows.map((row) => this.toEntity(row, assignees.get(row.id) ?? []));
  }

  async findById({ id, issueId }: IssueRequestDto): Promise<Issue | null> {
    const deletedStatusId = await this.getStatusId(IssueStatusKey.DELETED);
    const [row] = await this.db
      .select()
      .from(issues)
      .where(
        and(
          eq(issues.id, issueId),
          eq(issues.projectId, id),
          ne(issues.statusId, deletedStatusId),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    const assignees = await this.findAssigneeIds([row.id]);

    return this.toEntity(row, assignees.get(row.id) ?? []);
  }

  async hasChildren({ id, issueId }: IssueRequestDto): Promise<boolean> {
    const deletedStatusId = await this.getStatusId(IssueStatusKey.DELETED);
    const [row] = await this.db
      .select({ id: issues.id })
      .from(issues)
      .where(
        and(
          eq(issues.projectId, id),
          eq(issues.parentId, issueId),
          ne(issues.statusId, deletedStatusId),
        ),
      )
      .limit(1);

    return row !== undefined;
  }

  async findLastBoardPosition({
    id,
    columnId,
  }: FindLastBoardPositionQuery): Promise<number | null> {
    const deletedStatusId = await this.getStatusId(IssueStatusKey.DELETED);
    const [row] = await this.db
      .select({ position: max(issues.boardPosition) })
      .from(issues)
      .where(
        and(
          eq(issues.projectId, id),
          eq(issues.columnId, columnId),
          ne(issues.statusId, deletedStatusId),
        ),
      );

    return row?.position ?? null;
  }

  async update(issue: Issue, actorUserId: number): Promise<void> {
    const deletedStatusId = await this.getStatusId(IssueStatusKey.DELETED);
    const [row] = await this.db
      .update(issues)
      .set({
        typeId: issue.typeId,
        columnId: issue.columnId,
        priorityId: issue.priorityId,
        difficultyId: issue.difficultyId,
        parentId: issue.parentId,
        title: issue.title,
        description: issue.description,
        boardPosition: issue.boardPosition,
        resolvedAt: issue.resolvedAt,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(
        and(
          eq(issues.id, issue.id!),
          eq(issues.projectId, issue.projectId),
          ne(issues.statusId, deletedStatusId),
        ),
      )
      .returning({ id: issues.id });

    if (!row) {
      throw new IssueNotFoundError(issue.id!);
    }
  }

  async replaceAssignees({
    issueId,
    userIds,
    actorUserId,
  }: ReplaceAssigneesCommand): Promise<void> {
    await this.db
      .delete(issueAssignees)
      .where(eq(issueAssignees.issueId, issueId));

    if (userIds.length > 0) {
      await this.db.insert(issueAssignees).values(
        userIds.map((userId) => ({
          issueId,
          userId,
          assignedByUserId: actorUserId,
          createdByUserId: actorUserId,
        })),
      );
    }
  }

  async delete({ id, issueId, actorUserId }: DeleteIssueCommand): Promise<void> {
    const deletedStatusId = await this.getStatusId(IssueStatusKey.DELETED);
    const [row] = await this.db
      .update(issues)
      .set({
        statusId: deletedStatusId,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(
        and(
          eq(issues.id, issueId),
          eq(issues.projectId, id),
          ne(issues.statusId, deletedStatusId),
        ),
      )
      .returning({ id: issues.id });

    if (!row) {
      throw new IssueNotFoundError(issueId);
    }

    // Las subtareas no tienen sentido sin su padre.
    await this.db
      .update(issues)
      .set({
        statusId: deletedStatusId,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(
        and(
          eq(issues.projectId, id),
          eq(issues.parentId, issueId),
          ne(issues.statusId, deletedStatusId),
        ),
      );
  }
}
