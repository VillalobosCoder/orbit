import { and, asc, eq, ne, notInArray } from "drizzle-orm";
import { StatusTypeKey, UserStatusKey } from "@orbit/shared";
import type { ProjectIdRequestDto, ProjectMemberDto, ProjectMemberRequestDto } from "@orbit/shared";
import type {
  AddProjectMemberCommand,
  ProjectMemberRepository,
} from "../../../application/project/ports/project-member-repository.port.js";
import {
  ProjectMemberAlreadyExistsError,
  ProjectMemberNotFoundError,
} from "../../../domain/project/project.errors.js";
import type { DbContext } from "../db-context.js";
import { projectMembers } from "../schema/project-members.js";
import { users } from "../schema/users.js";
import { buildAvatarUrl } from "../../../application/user/utils/avatar-url.js";
import { findStatusId } from "./find-status-id.js";

function isMemberUniqueViolation(error: unknown): boolean {
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
    error.constraint === "project_members_project_id_user_id_pk"
  );
}

const userColumns = {
  id: users.id,
  name: users.name,
  lastName: users.lastName,
  email: users.email,
  avatarFileId: users.avatarFileId,
};

type UserColumnsRow = { id: number; avatarFileId: number | null };

function toMemberDto<T extends UserColumnsRow>({
  avatarFileId,
  ...row
}: T): Omit<T, "avatarFileId"> & { avatarUrl: string | null } {
  return { ...row, avatarUrl: buildAvatarUrl(row.id, avatarFileId) };
}

export class DBProjectMemberRepository implements ProjectMemberRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private getDeletedUserStatusId(): Promise<number> {
    return findStatusId(this.db, StatusTypeKey.USER, UserStatusKey.DELETED);
  }

  async add({
    id,
    userId,
    actorUserId,
  }: AddProjectMemberCommand): Promise<void> {
    try {
      await this.db.insert(projectMembers).values({
        projectId: id,
        userId,
        createdByUserId: actorUserId,
      });
    } catch (error) {
      if (isMemberUniqueViolation(error)) {
        throw new ProjectMemberAlreadyExistsError();
      }

      throw error;
    }
  }

  async remove({ id, userId }: ProjectMemberRequestDto): Promise<void> {
    const [row] = await this.db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, id),
          eq(projectMembers.userId, userId),
        ),
      )
      .returning({ userId: projectMembers.userId });

    if (!row) {
      throw new ProjectMemberNotFoundError(userId);
    }
  }

  async findMembers({ id }: ProjectIdRequestDto): Promise<ProjectMemberDto[]> {
    const deletedStatusId = await this.getDeletedUserStatusId();

    const rows = await this.db
      .select(userColumns)
      .from(projectMembers)
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(
        and(
          eq(projectMembers.projectId, id),
          ne(users.statusId, deletedStatusId),
        ),
      )
      .orderBy(asc(users.name), asc(users.id));

    return rows.map(toMemberDto);
  }

  async findCandidates({
    id,
  }: ProjectIdRequestDto): Promise<ProjectMemberDto[]> {
    const deletedStatusId = await this.getDeletedUserStatusId();

    const rows = await this.db
      .select(userColumns)
      .from(users)
      .where(
        and(
          ne(users.statusId, deletedStatusId),
          notInArray(
            users.id,
            this.db
              .select({ id: projectMembers.userId })
              .from(projectMembers)
              .where(eq(projectMembers.projectId, id)),
          ),
        ),
      )
      .orderBy(asc(users.name), asc(users.id));

    return rows.map(toMemberDto);
  }
}
