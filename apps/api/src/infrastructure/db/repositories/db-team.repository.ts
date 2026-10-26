import { and, asc, eq, ne } from "drizzle-orm";
import { StatusTypeKey, TeamStatusKey } from "@orbit/shared";
import type { TeamRepository } from "../../../application/team/ports/team-repository.port.js";
import { Team } from "../../../domain/team/team.entity.js";
import {
  TeamAlreadyExistsError,
  TeamNotFoundError,
} from "../../../domain/team/team.errors.js";
import type { DbContext } from "../db-context.js";
import { teams } from "../schema/teams.js";
import { findStatusId } from "./find-status-id.js";

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
    error.constraint === "teams_owner_user_id_name_unique"
  );
}

export class DBTeamRepository implements TeamRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private getStatusId(statusKey: string): Promise<number> {
    return findStatusId(this.db, StatusTypeKey.TEAM, statusKey);
  }

  async save(team: Team, actorUserId: number): Promise<number> {
    const activeStatusId = await this.getStatusId(TeamStatusKey.ACTIVE);

    try {
      const [created] = await this.db
        .insert(teams)
        .values({
          ownerUserId: team.ownerUserId,
          statusId: activeStatusId,
          name: team.name,
          description: team.description,
          createdByUserId: actorUserId,
        })
        .returning({ id: teams.id });

      return created.id;
    } catch (error) {
      if (isNameUniqueViolation(error)) {
        throw new TeamAlreadyExistsError(team.name);
      }

      throw error;
    }
  }

  async findAllByOwner(ownerUserId: number): Promise<Team[]> {
    const deletedStatusId = await this.getStatusId(TeamStatusKey.DELETED);
    const rows = await this.db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.ownerUserId, ownerUserId),
          ne(teams.statusId, deletedStatusId),
        ),
      )
      .orderBy(asc(teams.name), asc(teams.id));

    return rows.map((row) => Team.fromPersistence(row));
  }

  async findById(id: number, ownerUserId: number): Promise<Team | null> {
    const deletedStatusId = await this.getStatusId(TeamStatusKey.DELETED);
    const [row] = await this.db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.id, id),
          eq(teams.ownerUserId, ownerUserId),
          ne(teams.statusId, deletedStatusId),
        ),
      )
      .limit(1);

    return row ? Team.fromPersistence(row) : null;
  }

  async update(team: Team, actorUserId: number): Promise<void> {
    const deletedStatusId = await this.getStatusId(TeamStatusKey.DELETED);

    try {
      const [row] = await this.db
        .update(teams)
        .set({
          name: team.name,
          description: team.description,
          updatedAt: new Date(),
          updatedByUserId: actorUserId,
        })
        .where(
          and(
            eq(teams.id, team.id!),
            eq(teams.ownerUserId, team.ownerUserId),
            ne(teams.statusId, deletedStatusId),
          ),
        )
        .returning({ id: teams.id });

      if (!row) {
        throw new TeamNotFoundError(team.id!);
      }
    } catch (error) {
      if (isNameUniqueViolation(error)) {
        throw new TeamAlreadyExistsError(team.name);
      }

      throw error;
    }
  }

  async delete(
    id: number,
    ownerUserId: number,
    actorUserId: number,
  ): Promise<void> {
    const deletedStatusId = await this.getStatusId(TeamStatusKey.DELETED);
    const [row] = await this.db
      .update(teams)
      .set({
        statusId: deletedStatusId,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(
        and(
          eq(teams.id, id),
          eq(teams.ownerUserId, ownerUserId),
          ne(teams.statusId, deletedStatusId),
        ),
      )
      .returning({ id: teams.id });

    if (!row) {
      throw new TeamNotFoundError(id);
    }
  }
}
