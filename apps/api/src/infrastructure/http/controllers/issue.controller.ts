import type { NextFunction, Response } from "express";
import {
  ModuleKey,
  type BoardDto,
  type IssueDto,
  type IssueOptionsDto,
  type IssueRequestDto,
  type MoveIssueRequestDto,
  type SaveIssueRequestDto,
} from "@orbit/shared";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { CreateIssueUseCase } from "../../../application/issue/use-cases/create-issue.use-case.js";
import type { DeleteIssueUseCase } from "../../../application/issue/use-cases/delete-issue.use-case.js";
import type { GetBoardUseCase } from "../../../application/issue/use-cases/get-board.use-case.js";
import type { GetIssueOptionsUseCase } from "../../../application/issue/use-cases/get-issue-options.use-case.js";
import type { GetIssueUseCase } from "../../../application/issue/use-cases/get-issue.use-case.js";
import type { MoveIssueUseCase } from "../../../application/issue/use-cases/move-issue.use-case.js";
import type { UpdateIssueUseCase } from "../../../application/issue/use-cases/update-issue.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import {
  issueParamSchema,
  moveIssueSchema,
  saveIssueSchema,
} from "../schemas/issue.schema.js";
import { projectIdParamSchema } from "../schemas/project.schema.js";

export class IssueController {
  constructor(
    private readonly getBoardUseCase: GetBoardUseCase,
    private readonly getIssueOptionsUseCase: GetIssueOptionsUseCase,
    private readonly createIssueUseCase: CreateIssueUseCase,
    private readonly getIssueUseCase: GetIssueUseCase,
    private readonly updateIssueUseCase: UpdateIssueUseCase,
    private readonly moveIssueUseCase: MoveIssueUseCase,
    private readonly deleteIssueUseCase: DeleteIssueUseCase,
    private readonly permissions: UserPermissionRepository,
  ) {}

  getBoard = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const response: BoardDto = await this.getBoardUseCase.execute({
        id,
        actorUserId: req.auth!.id,
      });
      // El tablero se consulta por polling: siempre se revalida con el ETag.
      res.set("Cache-Control", "no-cache").status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getOptions = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const response: IssueOptionsDto =
        await this.getIssueOptionsUseCase.execute({
          id,
          actorUserId: req.auth!.id,
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
      const { id } = projectIdParamSchema.parse(req.params);
      const input: SaveIssueRequestDto = saveIssueSchema.parse(req.body);
      const response: IssueDto = await this.createIssueUseCase.execute({
        ...input,
        id,
        actorUserId: req.auth!.id,
      });
      res.status(201).json(response);
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
      const { id, issueId }: IssueRequestDto = issueParamSchema.parse(
        req.params,
      );
      const response: IssueDto = await this.getIssueUseCase.execute({
        id,
        issueId,
        actorUserId: req.auth!.id,
      });
      res.status(200).json(response);
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
      const { id, issueId }: IssueRequestDto = issueParamSchema.parse(
        req.params,
      );
      const input: SaveIssueRequestDto = saveIssueSchema.parse(req.body);
      const actorUserId = req.auth!.id;
      const [canMoveIssues, canAssignSprints] = await Promise.all([
        this.permissions.hasPermission(
          actorUserId,
          ModuleKey.PROJECT_MOVE_ISSUES,
          "write",
        ),
        this.permissions.hasPermission(
          actorUserId,
          ModuleKey.PROJECT_SPRINTS,
          "write",
        ),
      ]);
      await this.updateIssueUseCase.execute({
        ...input,
        id,
        issueId,
        actorUserId,
        canMoveIssues,
        canAssignSprints,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  move = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, issueId }: IssueRequestDto = issueParamSchema.parse(
        req.params,
      );
      const input: MoveIssueRequestDto = moveIssueSchema.parse(req.body);
      await this.moveIssueUseCase.execute({
        ...input,
        id,
        issueId,
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
      const { id, issueId }: IssueRequestDto = issueParamSchema.parse(
        req.params,
      );
      await this.deleteIssueUseCase.execute({
        id,
        issueId,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
