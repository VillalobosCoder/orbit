import { alias } from "drizzle-orm/pg-core";
import { asc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ModuleRepository } from "../../../application/modules/ports/module-repository.port.js";
import { modules } from "../schema/modules.js";

const parentModules = alias(modules, "parent_modules");

export class DBModuleRepository implements ModuleRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async findAll() {
    const rows = await this.db
      .select({
        key: modules.key,
        parentKey: parentModules.key,
        name: modules.name,
        icon: modules.icon,
        sortOrder: modules.sortOrder,
      })
      .from(modules)
      .leftJoin(parentModules, eq(modules.parentId, parentModules.id))
      .orderBy(asc(modules.sortOrder), asc(modules.id));

    return rows;
  }
}
