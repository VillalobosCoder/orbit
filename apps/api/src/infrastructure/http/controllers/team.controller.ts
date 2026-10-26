import type { NextFunction, Response } from "express";
import type {
  SaveTeamRequestDto,
  TeamDto,
  TeamIdRequestDto,
} from "@orbit/shared";
import type { CreateTeamUseCase } from "../../../application/team/use-cases/create-team.use-case.js";
import type { DeleteTeamUseCase } from "../../../application/team/use-cases/delete-team.use-case.js";
import type { GetTeamListUseCase } from "../../../application/team/use-cases/get-team-list.use-case.js";
import type { GetTeamUseCase } from "../../../application/team/use-cases/get-team.use-case.js";
import type { UpdateTeamUseCase } from "../../../application/team/use-cases/update-team.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import { saveTeamSchema, teamIdParamSchema } from "../schemas/team.schema.js";

export class TeamController {
  constructor(
    private readonly getTeamListUseCase: GetTeamListUseCase,
    private readonly getTeamUseCase: GetTeamUseCase,
    private readonly createTeamUseCase: CreateTeamUseCase,
    private readonly updateTeamUseCase: UpdateTeamUseCase,
    private readonly deleteTeamUseCase: DeleteTeamUseCase,
  ) {}

  getAll = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const ownerUserId = req.auth!.id;
      const response: TeamDto[] = await this.getTeamListUseCase.execute({
        ownerUserId,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: TeamIdRequestDto = teamIdParamSchema.parse(req.params);
      const response: TeamDto = await this.getTeamUseCase.execute({
        id,
        ownerUserId: req.auth!.id,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const input: SaveTeamRequestDto = saveTeamSchema.parse(req.body);
      const response: TeamDto = await this.createTeamUseCase.execute({
        ...input,
        ownerUserId: req.auth!.id,
      });
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: TeamIdRequestDto = teamIdParamSchema.parse(req.params);
      const input: SaveTeamRequestDto = saveTeamSchema.parse(req.body);
      await this.updateTeamUseCase.execute({
        ...input,
        id,
        ownerUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id }: TeamIdRequestDto = teamIdParamSchema.parse(req.params);
      await this.deleteTeamUseCase.execute({ id, ownerUserId: req.auth!.id });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
