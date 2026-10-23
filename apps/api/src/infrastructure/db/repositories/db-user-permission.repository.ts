import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import { modules } from "../schema/modules.js";
import { userPermissions } from "../schema/user-permissions.js";

export class DBUserPermissionRepository implements UserPermissionRepository {
  constructor(private readonly db: NodePgDatabase) {}

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
