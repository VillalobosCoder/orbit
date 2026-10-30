import { and, asc, eq } from "drizzle-orm";
import {
  SprintStatus,
  type ProjectIdRequestDto,
  type SprintRequestDto,
} from "@orbit/shared";
import type { SprintRepository } from "../../../application/sprint/ports/sprint-repository.port.js";
import { Sprint } from "../../../domain/sprint/sprint.entity.js";
import {
  ActiveSprintAlreadyExistsError,
  SprintNameAlreadyExistsError,
  SprintNotFoundError,
} from "../../../domain/sprint/sprint.errors.js";
import type { DbContext } from "../db-context.js";
import { sprints } from "../schema/sprints.js";
import type { ActorUserId } from "../../../application/shared/actor.js";

function violatesConstraint(error: unknown, constraint: string): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    !("constraint" in error)
  ) {
    return false;
  }

  return error.code === "23505" && error.constraint === constraint;
}

export class DBSprintRepository implements SprintRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private toEntity(row: typeof sprints.$inferSelect): Sprint {
    return Sprint.fromPersistence({
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      goal: row.goal,
      startDate: row.startDate,
      endDate: row.endDate,
      status: row.status as SprintStatus,
    });
  }

  async save(sprint: Sprint, actorUserId: ActorUserId): Promise<number> {
    try {
      const [created] = await this.db
        .insert(sprints)
        .values({
          projectId: sprint.projectId,
          name: sprint.name,
          goal: sprint.goal,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          status: sprint.status,
          createdByUserId: actorUserId,
        })
        .returning({ id: sprints.id });

      return created.id;
    } catch (error) {
      if (violatesConstraint(error, "sprints_project_id_name_unique")) {
        throw new SprintNameAlreadyExistsError(sprint.name);
      }

      throw error;
    }
  }

  async findAllByProject({ id }: ProjectIdRequestDto): Promise<Sprint[]> {
    const rows = await this.db
      .select()
      .from(sprints)
      .where(eq(sprints.projectId, id))
      .orderBy(asc(sprints.id));

    return rows.map((row) => this.toEntity(row));
  }

  async findById({ id, sprintId }: SprintRequestDto): Promise<Sprint | null> {
    const [row] = await this.db
      .select()
      .from(sprints)
      .where(and(eq(sprints.id, sprintId), eq(sprints.projectId, id)))
      .limit(1);

    return row ? this.toEntity(row) : null;
  }

  async findActive({ id }: ProjectIdRequestDto): Promise<Sprint | null> {
    const [row] = await this.db
      .select()
      .from(sprints)
      .where(
        and(eq(sprints.projectId, id), eq(sprints.status, SprintStatus.ACTIVE)),
      )
      .limit(1);

    return row ? this.toEntity(row) : null;
  }

  async update(sprint: Sprint, actorUserId: ActorUserId): Promise<void> {
    try {
      const [row] = await this.db
        .update(sprints)
        .set({
          name: sprint.name,
          goal: sprint.goal,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          status: sprint.status,
          updatedAt: new Date(),
          updatedByUserId: actorUserId,
        })
        .where(
          and(eq(sprints.id, sprint.id!), eq(sprints.projectId, sprint.projectId)),
        )
        .returning({ id: sprints.id });

      if (!row) {
        throw new SprintNotFoundError(sprint.id!);
      }
    } catch (error) {
      if (violatesConstraint(error, "sprints_project_id_name_unique")) {
        throw new SprintNameAlreadyExistsError(sprint.name);
      }

      if (violatesConstraint(error, "sprints_one_active_per_project")) {
        throw new ActiveSprintAlreadyExistsError();
      }

      throw error;
    }
  }

  async delete({ id, sprintId }: SprintRequestDto): Promise<void> {
    const [row] = await this.db
      .delete(sprints)
      .where(and(eq(sprints.id, sprintId), eq(sprints.projectId, id)))
      .returning({ id: sprints.id });

    if (!row) {
      throw new SprintNotFoundError(sprintId);
    }
  }
}
