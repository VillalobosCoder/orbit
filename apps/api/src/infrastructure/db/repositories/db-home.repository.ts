import { and, asc, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
import {
  BoardColumnCategory,
  IssueStatusKey,
  ProjectStatusKey,
  SprintStatus,
  StatusTypeKey,
  type HomeActiveSprintDto,
  type HomeSummaryDto,
} from "@orbit/shared";
import type {
  GetHomeSummaryQuery,
  HomeRepository,
} from "../../../application/home/ports/home-repository.port.js";
import type { DbContext } from "../db-context.js";
import { boardColumns } from "../schema/board-columns.js";
import { issueAssignees } from "../schema/issue-assignees.js";
import { issues } from "../schema/issues.js";
import { projectMembers } from "../schema/project-members.js";
import { projects } from "../schema/projects.js";
import { sprints } from "../schema/sprints.js";
import { findStatusId } from "./find-status-id.js";

export class DBHomeRepository implements HomeRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  async getSummary({
    actorUserId,
    assignedLimit,
  }: GetHomeSummaryQuery): Promise<HomeSummaryDto> {
    const deletedProjectStatusId = await findStatusId(
      this.db,
      StatusTypeKey.PROJECT,
      ProjectStatusKey.DELETED,
    );
    const deletedIssueStatusId = await findStatusId(
      this.db,
      StatusTypeKey.ISSUE,
      IssueStatusKey.DELETED,
    );

    const memberProjects = await this.db
      .select({
        id: projects.id,
        projectKey: projects.projectKey,
        name: projects.name,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
      .where(
        and(
          eq(projectMembers.userId, actorUserId),
          ne(projects.statusId, deletedProjectStatusId),
        ),
      )
      .orderBy(asc(projects.name), asc(projects.id));

    if (memberProjects.length === 0) {
      return {
        projects: [],
        assigned: { total: 0, inProgress: 0, items: [] },
      };
    }

    const projectIds = memberProjects.map((project) => project.id);
    const activeSprints = await this.db
      .select({
        id: sprints.id,
        projectId: sprints.projectId,
        name: sprints.name,
        endDate: sprints.endDate,
      })
      .from(sprints)
      .where(
        and(
          inArray(sprints.projectId, projectIds),
          eq(sprints.status, SprintStatus.ACTIVE),
        ),
      );

    const progressBySprint = new Map<
      number,
      { totalIssues: number; doneIssues: number }
    >();

    if (activeSprints.length > 0) {
      const progressRows = await this.db
        .select({
          sprintId: issues.sprintId,
          totalIssues: sql<number>`count(*)::int`,
          doneIssues: sql<number>`(count(*) filter (where ${boardColumns.category} = ${BoardColumnCategory.DONE}))::int`,
        })
        .from(issues)
        .innerJoin(boardColumns, eq(boardColumns.id, issues.columnId))
        .where(
          and(
            inArray(
              issues.sprintId,
              activeSprints.map((sprint) => sprint.id),
            ),
            isNull(issues.parentId),
            ne(issues.statusId, deletedIssueStatusId),
          ),
        )
        .groupBy(issues.sprintId);

      progressRows.forEach((row) => {
        if (row.sprintId !== null) {
          progressBySprint.set(row.sprintId, row);
        }
      });
    }

    const backlogRows = await this.db
      .select({
        projectId: issues.projectId,
        total: sql<number>`count(*)::int`,
      })
      .from(issues)
      .where(
        and(
          inArray(issues.projectId, projectIds),
          isNull(issues.sprintId),
          ne(issues.statusId, deletedIssueStatusId),
        ),
      )
      .groupBy(issues.projectId);
    const backlogByProject = new Map(
      backlogRows.map((row) => [row.projectId, row.total]),
    );

    const assignedFilter = and(
      eq(issueAssignees.userId, actorUserId),
      inArray(issues.projectId, projectIds),
      ne(issues.statusId, deletedIssueStatusId),
      ne(boardColumns.category, BoardColumnCategory.DONE),
      or(isNull(sprints.id), ne(sprints.status, SprintStatus.CLOSED)),
    );
    const assignedBase = this.db
      .select({
        total: sql<number>`count(*)::int`,
        inProgress: sql<number>`(count(*) filter (where ${boardColumns.category} = ${BoardColumnCategory.IN_PROGRESS}))::int`,
      })
      .from(issues)
      .innerJoin(issueAssignees, eq(issueAssignees.issueId, issues.id))
      .innerJoin(boardColumns, eq(boardColumns.id, issues.columnId))
      .leftJoin(sprints, eq(sprints.id, issues.sprintId))
      .where(assignedFilter);
    const [counts] = await assignedBase;

    const assignedRows = await this.db
      .select({
        id: issues.id,
        issueNumber: issues.issueNumber,
        title: issues.title,
        projectId: issues.projectId,
        projectKey: projects.projectKey,
        columnName: boardColumns.name,
        category: boardColumns.category,
      })
      .from(issues)
      .innerJoin(issueAssignees, eq(issueAssignees.issueId, issues.id))
      .innerJoin(boardColumns, eq(boardColumns.id, issues.columnId))
      .innerJoin(projects, eq(projects.id, issues.projectId))
      .leftJoin(sprints, eq(sprints.id, issues.sprintId))
      .where(assignedFilter)
      .orderBy(
        sql`case when ${boardColumns.category} = ${BoardColumnCategory.IN_PROGRESS} then 0 else 1 end`,
        asc(projects.projectKey),
        asc(issues.issueNumber),
      )
      .limit(assignedLimit);

    return {
      projects: memberProjects.map((project) => {
        const sprint = activeSprints.find(
          (item) => item.projectId === project.id,
        );
        const progress = sprint ? progressBySprint.get(sprint.id) : undefined;
        const activeSprint: HomeActiveSprintDto | null = sprint
          ? {
              id: sprint.id,
              name: sprint.name,
              endDate: sprint.endDate,
              totalIssues: progress?.totalIssues ?? 0,
              doneIssues: progress?.doneIssues ?? 0,
            }
          : null;

        return {
          id: project.id,
          projectKey: project.projectKey,
          name: project.name,
          activeSprint,
          backlogIssues: backlogByProject.get(project.id) ?? 0,
        };
      }),
      assigned: {
        total: counts?.total ?? 0,
        inProgress: counts?.inProgress ?? 0,
        items: assignedRows.map((row) => ({
          id: row.id,
          issueKey: `${row.projectKey}-${row.issueNumber}`,
          title: row.title,
          projectId: row.projectId,
          columnName: row.columnName,
          category: row.category as BoardColumnCategory,
        })),
      },
    };
  }
}
