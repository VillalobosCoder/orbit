import type { ModuleDto } from "@orbit/shared";

export interface ModuleRepository {
  findAll(): Promise<ModuleDto[]>;
}
