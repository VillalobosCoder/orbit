import { and, eq, ne, sql } from "drizzle-orm";
import {
  UserRepository,
  type SetUserPasswordCommand,
} from "../../../application/user/ports/user-repository.port.js";
import { User } from "../../../domain/user/user.entity.js";
import { Email } from "../../../domain/user/value-objects/email.vo.js";
import { StatusTypeKey, UserStatusKey } from "@orbit/shared";
import {
  UserAlreadyExistsError,
  InitialAdminAlreadyExistsError,
  UserNotFoundError,
} from "../../../domain/user/user.errors.js";
import type { DbContext } from "../db-context.js";
import { findStatusId } from "./find-status-id.js";
import { users } from "../schema/users.js";
import { statuses } from "../schema/statuses.js";
import { modules } from "../schema/modules.js";
import { userPermissions } from "../schema/user-permissions.js";

function isEmailUniqueViolation(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    !("constraint" in error)
  ) {
    return false;
  }

  return error.code === "23505" && error.constraint === "users_email_unique";
}

export class DBUserRepository implements UserRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  private getStatusId(statusKey: string): Promise<number> {
    return findStatusId(this.db, StatusTypeKey.USER, statusKey);
  }

  async save(user: User, createdByUserId: number): Promise<number> {
    const data = user.toPrimitives();
    const activeStatusId = await this.getStatusId(UserStatusKey.ACTIVE);

    try {
      const [createdUser] = await this.db
        .insert(users)
        .values({
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          mustChangePassword: data.mustChangePassword,
          statusId: activeStatusId,
          createdByUserId,
        })
        .returning({ id: users.id });

      return createdUser.id;
    } catch (error) {
      if (isEmailUniqueViolation(error)) {
        throw new UserAlreadyExistsError(data.email);
      }

      throw error;
    }
  }

  async bootstrapInitialAdmin(user: User): Promise<void> {
    const data = user.toPrimitives();

    try {
      await this.db.execute(sql`SELECT pg_advisory_xact_lock(804219731)`);

      const [userCount] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users);
      if (userCount.count > 0) {
        throw new InitialAdminAlreadyExistsError();
      }

      const [activeStatus] = await this.db
        .select({ id: statuses.id })
        .from(statuses)
        .where(
          and(
            eq(statuses.key, UserStatusKey.ACTIVE),
            eq(statuses.statusTypeKey, StatusTypeKey.USER),
          ),
        )
        .limit(1);
      if (!activeStatus) {
        throw new Error("No existe el estado activo de usuario.");
      }

      const moduleRows = await this.db.select({ id: modules.id }).from(modules);
      if (moduleRows.length === 0) {
        throw new Error("No hay módulos configurados para asignar permisos.");
      }

      const [createdUser] = await this.db
        .insert(users)
        .values({
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          statusId: activeStatus.id,
        })
        .returning({ id: users.id });

      await this.db.insert(userPermissions).values(
        moduleRows.map((module) => ({
          userId: createdUser.id,
          moduleId: module.id,
          canRead: true,
          canWrite: true,
          createdByUserId: createdUser.id,
        })),
      );
    } catch (error) {
      if (isEmailUniqueViolation(error)) {
        throw new UserAlreadyExistsError(data.email);
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const deletedStatusId = await this.getStatusId(UserStatusKey.DELETED);
    const [row] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, Email.create(email).toString()),
          ne(users.statusId, deletedStatusId),
        ),
      )
      .limit(1);

    return row ? User.fromPersistence(row) : null;
  }

  async findById(id: number): Promise<User | null> {
    const deletedStatusId = await this.getStatusId(UserStatusKey.DELETED);
    const [row] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, id),
          ne(users.statusId, deletedStatusId),
        ),
      )
      .limit(1);

    return row ? User.fromPersistence(row) : null;
  }

  async findAll(): Promise<User[]> {
    const deletedStatusId = await this.getStatusId(UserStatusKey.DELETED);
    const rows = await this.db
      .select()
      .from(users)
      .where(ne(users.statusId, deletedStatusId));
    return rows.map((row) => User.fromPersistence(row));
  }

  async update(user: User, updatedByUserId: number): Promise<void> {
    const { id, ...data } = user.toPrimitives();
    const deletedStatusId = await this.getStatusId(UserStatusKey.DELETED);

    try {
      const [row] = await this.db
        .update(users)
        .set({
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          updatedAt: new Date(),
          updatedByUserId,
        })
        .where(and(eq(users.id, id!), ne(users.statusId, deletedStatusId)))
        .returning({ id: users.id });

      if (!row) {
        throw new UserNotFoundError(id!);
      }
    } catch (error) {
      if (isEmailUniqueViolation(error)) {
        throw new UserAlreadyExistsError(data.email);
      }

      throw error;
    }
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    const deletedStatusId = await this.getStatusId(UserStatusKey.DELETED);
    const [row] = await this.db
      .update(users)
      .set({
        password: passwordHash,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(users.id, id),
          ne(users.statusId, deletedStatusId),
        ),
      )
      .returning({ id: users.id });

    if (!row) {
      throw new UserNotFoundError(id);
    }
  }

  async setPassword({
    id,
    passwordHash,
    mustChangePassword,
    actorUserId,
  }: SetUserPasswordCommand): Promise<void> {
    const deletedStatusId = await this.getStatusId(UserStatusKey.DELETED);
    const [row] = await this.db
      .update(users)
      .set({
        password: passwordHash,
        mustChangePassword,
        updatedAt: new Date(),
        updatedByUserId: actorUserId,
      })
      .where(and(eq(users.id, id), ne(users.statusId, deletedStatusId)))
      .returning({ id: users.id });

    if (!row) {
      throw new UserNotFoundError(id);
    }
  }

  async delete(id: number): Promise<void> {
    const deletedStatusId = await this.getStatusId(UserStatusKey.DELETED);
    const [row] = await this.db
      .update(users)
      .set({
        statusId: deletedStatusId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(users.id, id),
          ne(users.statusId, deletedStatusId),
        ),
      )
      .returning({ id: users.id });

    if (!row) {
      throw new UserNotFoundError(id);
    }
  }
}
