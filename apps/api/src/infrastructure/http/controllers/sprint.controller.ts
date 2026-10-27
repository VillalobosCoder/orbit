import type { NextFunction, Response } from "express";
import type {
  AssignSprintRequestDto,
  IssueRequestDto,
  PlanningDto,
  SaveSprintRequestDto,
  SprintDto,
  SprintRequestDto,
} from "@orbit/shared";
import type { AssignIssueSprintUseCase } from "../../../application/sprint/use-cases/assign-issue-sprint.use-case.js";
import type { CloseSprintUseCase } from "../../../application/sprint/use-cases/close-sprint.use-case.js";
import type { CreateSprintUseCase } from "../../../application/sprint/use-cases/create-sprint.use-case.js";
import type { DeleteSprintUseCase } from "../../../application/sprint/use-cases/delete-sprint.use-case.js";
import type { GetPlanningUseCase } from "../../../application/sprint/use-cases/get-planning.use-case.js";
import type { StartSprintUseCase } from "../../../application/sprint/use-cases/start-sprint.use-case.js";
import type { UpdateSprintUseCase } from "../../../application/sprint/use-cases/update-sprint.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import { issueParamSchema } from "../schemas/issue.schema.js";
import { projectIdParamSchema } from "../schemas/project.schema.js";
import {
  assignSprintSchema,
  saveSprintSchema,
  sprintParamSchema,
} from "../schemas/sprint.schema.js";

export class SprintController {
  constructor(
    private readonly getPlanningUseCase: GetPlanningUseCase,
    private readonly createSprintUseCase: CreateSprintUseCase,
    private readonly updateSprintUseCase: UpdateSprintUseCase,
    private readonly deleteSprintUseCase: DeleteSprintUseCase,
    private readonly startSprintUseCase: StartSprintUseCase,
    private readonly closeSprintUseCase: CloseSprintUseCase,
    private readonly assignIssueSprintUseCase: AssignIssueSprintUseCase,
  ) {}

  getPlanning = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const response: PlanningDto = await this.getPlanningUseCase.execute({
        id,
        actorUserId: req.auth!.id,
      });
      res.set("Cache-Control", "no-cache").status(200).json(response);
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
      const { id } = projectIdParamSchema.parse(req.params);
      const input: SaveSprintRequestDto = saveSprintSchema.parse(req.body);
      const response: SprintDto = await this.createSprintUseCase.execute({
        ...input,
        id,
        actorUserId: req.auth!.id,
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
      const params: SprintRequestDto = sprintParamSchema.parse(req.params);
      const input: SaveSprintRequestDto = saveSprintSchema.parse(req.body);
      await this.updateSprintUseCase.execute({
        ...input,
        ...params,
        actorUserId: req.auth!.id,
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
      const params: SprintRequestDto = sprintParamSchema.parse(req.params);
      await this.deleteSprintUseCase.execute({
        ...params,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  start = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params: SprintRequestDto = sprintParamSchema.parse(req.params);
      await this.startSprintUseCase.execute({
        ...params,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  close = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params: SprintRequestDto = sprintParamSchema.parse(req.params);
      await this.closeSprintUseCase.execute({
        ...params,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  assignIssue = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params: IssueRequestDto = issueParamSchema.parse(req.params);
      const { sprintId }: AssignSprintRequestDto = assignSprintSchema.parse(
        req.body,
      );
      await this.assignIssueSprintUseCase.execute({
        ...params,
        sprintId,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
