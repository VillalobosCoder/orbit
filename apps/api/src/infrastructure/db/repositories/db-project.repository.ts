import { and, asc, eq, ne, sql } from "drizzle-orm";
import {
  ProjectStatusKey,
  StatusTypeKey,
  type ProjectIdRequestDto,
} from "@orbit/shared";
import type {
  DeleteProjectCommand,
  FindProjectForMemberQuery,
  ProjectRepository,
} from "../../../application/project/ports/project-repository.port.js";
import { Project } from "../../../domain/project/project.entity.js";
import {
  ProjectKeyAlreadyExistsError,
  ProjectNotFoundError,
} from "../../../domain/project/project.errors.js";
import type { DbContext } from "../db-context.js";
import { projectMembers } from "../schema/project-members.js";
import { projects } from "../schema/projects.js";
import { findStatusId } from "./find-status-id.js";
import type { ActorUserId } from "../../../application/shared/actor.js";

function isProjectKeyUniqueViolation(error: unknown): boolean {
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
    error.constraint === "projects_owner_user_id_project_key_unique"
  );
}

export class DBProjectRepository implements ProjectRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private getStatusId(statusKey: string): Promise<number> {
    return findStatusId(this.db, StatusTypeKey.PROJECT, statusKey);
  }

  async save(project: Project, actorUserId: ActorUserId): Promise<number> {
    const activeStatusId = await this.getStatusId(ProjectStatusKey.ACTIVE);

    try {
      const [created] = await this.db
        .insert(projects)
        .values({
          ownerUserId: project.ownerUserId,
          statusId: activeStatusId,
          projectKey: project.projectKey,
          name: project.name,
          description: project.description,
          createdByUserId: actorUserId,
        })
        .returning({ id: projects.id });

      return created.id;
    } catch (error) {
      if (isProjectKeyUniqueViolation(error)) {
        throw new ProjectKeyAlreadyExistsError(project.projectKey);
      }

      throw error;
    }
  }

  async findAllByMember(userId: number): Promise<Project[]> {
    const deletedStatusId = await this.getStatusId(ProjectStatusKey.DELETED);
    const rows = await this.db
      .select({ project: projects })
      .from(projects)
      .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
      .where(
        and(
          eq(projectMembers.userId, userId),
          ne(projects.statusId, deletedStatusId),
        ),
      )
      .orderBy(asc(projects.name), asc(projects.id));

    return rows.map(({ project }) => Project.fromPersistence(project));
  }

  async findByIdForMember({
    id,
    userId,
  }: FindProjectForMemberQuery): Promise<Project | null> {
    const deletedStatusId = await this.getStatusId(ProjectStatusKey.DELETED);
    const [row] = await this.db
      .select({ project: projects })
      .from(projects)
      .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
      .where(
        and(
          eq(projects.id, id),
          eq(projectMembers.userId, userId),
          ne(projects.statusId, deletedStatusId),
        ),
      )
      .limit(1);

    return row ? Project.fromPersistence(row.project) : null;
  }

  async update(project: Project, actorUserId: ActorUserId): Promise<void> {
    const deletedStatusId = await this.getStatusId(ProjectStatusKey.DELETED);
    const [row] = await this.db
      .update(projects)
      .set({
        name: project.name,
        description: project.description,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(
        and(eq(projects.id, project.id!), ne(projects.statusId, deletedStatusId)),
      )
      .returning({ id: projects.id });

    if (!row) {
      throw new ProjectNotFoundError(project.id!);
    }
  }

  async nextIssueNumber({ id }: ProjectIdRequestDto): Promise<number> {
    const [row] = await this.db
      .update(projects)
      .set({ issueCounter: sql`${projects.issueCounter} + 1` })
      .where(eq(projects.id, id))
      .returning({ issueNumber: projects.issueCounter });

    if (!row) {
      throw new ProjectNotFoundError(id);
    }

    return row.issueNumber;
  }

  async delete({ id, actorUserId }: DeleteProjectCommand): Promise<void> {
    const deletedStatusId = await this.getStatusId(ProjectStatusKey.DELETED);
    const [row] = await this.db
      .update(projects)
      .set({
        statusId: deletedStatusId,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(and(eq(projects.id, id), ne(projects.statusId, deletedStatusId)))
      .returning({ id: projects.id });

    if (!row) {
      throw new ProjectNotFoundError(id);
    }
  }
}
