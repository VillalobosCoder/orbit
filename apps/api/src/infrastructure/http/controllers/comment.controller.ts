import type { NextFunction, Response } from "express";
import type {
  CommentDto,
  IssueRequestDto,
  SaveCommentRequestDto,
} from "@orbit/shared";
import type { CreateCommentUseCase } from "../../../application/comment/use-cases/create-comment.use-case.js";
import type { DeleteCommentUseCase } from "../../../application/comment/use-cases/delete-comment.use-case.js";
import type { GetCommentsUseCase } from "../../../application/comment/use-cases/get-comments.use-case.js";
import type { UpdateCommentUseCase } from "../../../application/comment/use-cases/update-comment.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import {
  commentParamSchema,
  saveCommentSchema,
} from "../schemas/comment.schema.js";
import { issueParamSchema } from "../schemas/issue.schema.js";

export class CommentController {
  constructor(
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  getAll = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, issueId }: IssueRequestDto = issueParamSchema.parse(
        req.params,
      );
      const response: CommentDto[] = await this.getCommentsUseCase.execute({
        id,
        issueId,
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
      const { id, issueId }: IssueRequestDto = issueParamSchema.parse(
        req.params,
      );
      const input: SaveCommentRequestDto = saveCommentSchema.parse(req.body);
      const response: CommentDto = await this.createCommentUseCase.execute({
        ...input,
        id,
        issueId,
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
      const params = commentParamSchema.parse(req.params);
      const input: SaveCommentRequestDto = saveCommentSchema.parse(req.body);
      await this.updateCommentUseCase.execute({
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
      const params = commentParamSchema.parse(req.params);
      await this.deleteCommentUseCase.execute({
        ...params,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
