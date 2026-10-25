import { and, eq, inArray } from "drizzle-orm";
import type { UserPermissionDto } from "@orbit/shared";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import { InvalidUserPermissionError } from "../../../domain/user/user.errors.js";
import type { DbContext } from "../db-context.js";
import { modules } from "../schema/modules.js";
import { userPermissions } from "../schema/user-permissions.js";

export class DBUserPermissionRepository implements UserPermissionRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  async findByUserId(userId: number) {
    const rows = await this.db
      .select({
        module: modules.key,
        canRead: userPermissions.canRead,
        canWrite: userPermissions.canWrite,
      })
      .from(userPermissions)
      .innerJoin(modules, eq(userPermissions.moduleId, modules.id))
      .where(eq(userPermissions.userId, userId))
      .orderBy(modules.sortOrder, modules.id);

    return rows;
  }

  async replaceForUser(
    userId: number,
    permissions: UserPermissionDto[],
    actorUserId: number,
  ): Promise<void> {
    const moduleRows =
      permissions.length === 0
        ? []
        : await this.db
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

    await this.db
      .delete(userPermissions)
      .where(eq(userPermissions.userId, userId));

    if (permissions.length > 0) {
      await this.db.insert(userPermissions).values(
        permissions.map((permission) => ({
          userId,
          moduleId: modulesByKey.get(permission.module)!,
          canRead: permission.canRead,
          canWrite: permission.canWrite,
          createdByUserId: actorUserId,
          updatedByUserId: actorUserId,
        })),
      );
    }
  }

  async hasPermission(
    userId: number,
    moduleKey: string,
    action: "read" | "write",
  ): Promise<boolean> {
    const permissionColumn =
      action === "read" ? userPermissions.canRead : userPermissions.canWrite;
    const [permission] = await this.db
      .select({ id: userPermissions.id })
      .from(userPermissions)
      .innerJoin(modules, eq(userPermissions.moduleId, modules.id))
      .where(
        and(
          eq(userPermissions.userId, userId),
          eq(modules.key, moduleKey),
          eq(permissionColumn, true),
        ),
      )
      .limit(1);

    return permission !== undefined;
  }
}
