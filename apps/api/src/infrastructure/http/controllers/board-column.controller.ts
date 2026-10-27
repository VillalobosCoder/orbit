import type { NextFunction, Response } from "express";
import type {
  BoardColumnDto,
  BoardColumnRequestDto,
  CreateBoardColumnRequestDto,
  DeleteBoardColumnRequestDto,
  ReorderBoardColumnsRequestDto,
  SaveBoardColumnRequestDto,
} from "@orbit/shared";
import type { CreateBoardColumnUseCase } from "../../../application/board-column/use-cases/create-board-column.use-case.js";
import type { DeleteBoardColumnUseCase } from "../../../application/board-column/use-cases/delete-board-column.use-case.js";
import type { ReorderBoardColumnsUseCase } from "../../../application/board-column/use-cases/reorder-board-columns.use-case.js";
import type { UpdateBoardColumnUseCase } from "../../../application/board-column/use-cases/update-board-column.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import {
  boardColumnParamSchema,
  createBoardColumnSchema,
  deleteBoardColumnSchema,
  reorderBoardColumnsSchema,
  saveBoardColumnSchema,
} from "../schemas/board-column.schema.js";
import { projectIdParamSchema } from "../schemas/project.schema.js";

export class BoardColumnController {
  constructor(
    private readonly createBoardColumnUseCase: CreateBoardColumnUseCase,
    private readonly updateBoardColumnUseCase: UpdateBoardColumnUseCase,
    private readonly reorderBoardColumnsUseCase: ReorderBoardColumnsUseCase,
    private readonly deleteBoardColumnUseCase: DeleteBoardColumnUseCase,
  ) {}

  create = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const input: CreateBoardColumnRequestDto = createBoardColumnSchema.parse(
        req.body,
      );
      const response: BoardColumnDto =
        await this.createBoardColumnUseCase.execute({
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
      const params: BoardColumnRequestDto = boardColumnParamSchema.parse(
        req.params,
      );
      const input: SaveBoardColumnRequestDto = saveBoardColumnSchema.parse(
        req.body,
      );
      await this.updateBoardColumnUseCase.execute({
        ...input,
        ...params,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  reorder = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const input: ReorderBoardColumnsRequestDto =
        reorderBoardColumnsSchema.parse(req.body);
      await this.reorderBoardColumnsUseCase.execute({
        ...input,
        id,
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
      const params: BoardColumnRequestDto = boardColumnParamSchema.parse(
        req.params,
      );
      const input: DeleteBoardColumnRequestDto = deleteBoardColumnSchema.parse(
        req.body,
      );
      await this.deleteBoardColumnUseCase.execute({
        ...input,
        ...params,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
