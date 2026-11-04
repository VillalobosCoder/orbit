import type { Request, Response } from "express";
import type { ModuleDto } from "@orbit/shared";
import type { ModuleRepository } from "../../../application/modules/ports/module-repository.port.js";

export class ModuleController {
  constructor(private readonly modules: ModuleRepository) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const response: ModuleDto[] = await this.modules.findAll();
    res.status(200).json(response);
  };
}
