import { ModuleController } from "../module.controller.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createModuleController(dependencies: ControllerDependencies) {
  return new ModuleController(dependencies.moduleRepository);
}
