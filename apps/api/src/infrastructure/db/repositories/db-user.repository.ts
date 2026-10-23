import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { UserRepository } from "../../../application/user/ports/user-repository.port.js";
import type { UserPermissionAssignment } from "../../../application/user/ports/user-repository.port.js";
import { User } from "../../../domain/user/user.entity.js";
import { StatusTypeKey, UserStatusKey } from "@orbit/shared";
import {
  UserAlreadyExistsError,
  InitialAdminAlreadyExistsError,
  InvalidUserPermissionError,
  UserNotFoundError,
} from "../../../domain/user/user.errors.js";
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
  constructor(private readonly db: NodePgDatabase) {}

  private async getStatusId(statusKey: string): Promise<number> {
    const [status] = await this.db
      .select({ id: statuses.id })
      .from(statuses)
      .where(
        and(
          eq(statuses.key, statusKey),
          eq(statuses.statusTypeKey, StatusTypeKey.USER),
        ),
      )
      .limit(1);

    if (!status) {
      throw new Error(`No existe el estado de usuario "${statusKey}".`);
    }

    return status.id;
  }

  async save(
    user: User,
    permissions: UserPermissionAssignment[],
    createdByUserId: number,
  ): Promise<void> {
    const data = user.toPrimitives();
    const activeStatusId = await this.getStatusId(UserStatusKey.ACTIVE);

    try {
      await this.db.transaction(async (tx) => {
        const moduleRows =
          permissions.length === 0
            ? []
            : await tx
                .select({ id: modules.id, key: modules.key })
                .from(modules)
                .where(
                  inArray(
                    modules.key,
                    permissions.map((permission) => permission.module),
                  ),
                );
        const modulesByKey = new Map(
          moduleRows.map((module) => [module.key, module.id]),
        );

        for (const permission of permissions) {
          if (!modulesByKey.has(permission.module)) {
            throw new InvalidUserPermissionError(permission.module);
          }
        }

        const [createdUser] = await tx
          .insert(users)
          .values({
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            statusId: activeStatusId,
          })
          .returning({ id: users.id });

        if (permissions.length > 0) {
          await tx.insert(userPermissions).values(
            permissions.map((permission) => ({
              userId: createdUser.id,
              moduleId: modulesByKey.get(permission.module)!,
              canRead: permission.canRead,
              canWrite: permission.canWrite,
              createdByUserId,
            })),
          );
        }
      });
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
      await this.db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(804219731)`);

        const [userCount] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(users);
        if (userCount.count > 0) {
          throw new InitialAdminAlreadyExistsError();
        }

        const [activeStatus] = await tx
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

        const moduleRows = await tx
          .select({ id: modules.id })
          .from(modules);
        if (moduleRows.length === 0) {
          throw new Error("No hay módulos configurados para asignar permisos.");
        }

        const [createdUser] = await tx
          .insert(users)
          .values({
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            statusId: activeStatus.id,
          })
          .returning({ id: users.id });

        await tx.insert(userPermissions).values(
          moduleRows.map((module) => ({
            userId: createdUser.id,
            moduleId: module.id,
            canRead: true,
            canWrite: true,
            createdByUserId: createdUser.id,
          })),
        );
      });
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
          eq(users.email, email.trim().toLowerCase()),
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

  async update(user: User): Promise<void> {
    const { id, ...data } = user.toPrimitives();
    const deletedStatusId = await this.getStatusId(UserStatusKey.DELETED);

    try {
      const [row] = await this.db
        .update(users)
        .set({
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(users.id, id!),
            ne(users.statusId, deletedStatusId),
          ),
        )
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
