import { and, eq } from "drizzle-orm";
import type { UserPermissionDto } from "@orbit/shared";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import {
  InvalidUserPermissionError,
  PermissionRequiresParentModuleError,
} from "../../../domain/user/user.errors.js";
import type { DbContext } from "../db-context.js";
import { modules } from "../schema/modules.js";
import { userPermissions } from "../schema/user-permissions.js";
import type { ActorUserId } from "../../../application/shared/actor.js";

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
    actorUserId: ActorUserId,
  ): Promise<void> {
    const moduleRows = await this.db
      .select({
        id: modules.id,
        key: modules.key,
        name: modules.name,
        parentId: modules.parentId,
      })
      .from(modules);
    const modulesByKey = new Map(
      moduleRows.map((module) => [module.key, module]),
    );
    const grantedKeys = new Set(
      permissions
        .filter((permission) => permission.canRead || permission.canWrite)
        .map((permission) => permission.module),
    );

    for (const permission of permissions) {
      const module = modulesByKey.get(permission.module);

      if (!module) {
        throw new InvalidUserPermissionError(permission.module);
      }

      const parent = moduleRows.find((item) => item.id === module.parentId);

      if (parent && !grantedKeys.has(parent.key)) {
        throw new PermissionRequiresParentModuleError(module.name, parent.name);
      }
    }

    await this.db
      .delete(userPermissions)
      .where(eq(userPermissions.userId, userId));

    if (permissions.length > 0) {
      await this.db.insert(userPermissions).values(
        permissions.map((permission) => ({
          userId,
          moduleId: modulesByKey.get(permission.module)!.id,
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
