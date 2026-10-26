import type { NextFunction, Response } from "express";
import type {
  AddProjectMemberRequestDto,
  CreateProjectRequestDto,
  ProjectDto,
  ProjectMemberDto,
  ProjectMemberRequestDto,
  UpdateProjectRequestDto,
} from "@orbit/shared";
import type { AddProjectMemberUseCase } from "../../../application/project/use-cases/add-project-member.use-case.js";
import type { CreateProjectUseCase } from "../../../application/project/use-cases/create-project.use-case.js";
import type { DeleteProjectUseCase } from "../../../application/project/use-cases/delete-project.use-case.js";
import type { GetAvailableUsersUseCase } from "../../../application/project/use-cases/get-available-users.use-case.js";
import type { GetProjectListUseCase } from "../../../application/project/use-cases/get-project-list.use-case.js";
import type { GetProjectMembersUseCase } from "../../../application/project/use-cases/get-project-members.use-case.js";
import type { GetProjectUseCase } from "../../../application/project/use-cases/get-project.use-case.js";
import type { RemoveProjectMemberUseCase } from "../../../application/project/use-cases/remove-project-member.use-case.js";
import type { UpdateProjectUseCase } from "../../../application/project/use-cases/update-project.use-case.js";
import type { AuthedRequest } from "../middleware/auth.middleware.js";
import {
  addProjectMemberSchema,
  createProjectSchema,
  projectIdParamSchema,
  projectMemberParamSchema,
  updateProjectSchema,
} from "../schemas/project.schema.js";

export class ProjectController {
  constructor(
    private readonly getProjectListUseCase: GetProjectListUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly getProjectMembersUseCase: GetProjectMembersUseCase,
    private readonly getAvailableUsersUseCase: GetAvailableUsersUseCase,
    private readonly addProjectMemberUseCase: AddProjectMemberUseCase,
    private readonly removeProjectMemberUseCase: RemoveProjectMemberUseCase,
  ) {}

  getAll = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const response: ProjectDto[] = await this.getProjectListUseCase.execute({
        actorUserId: req.auth!.id,
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
      const { id } = projectIdParamSchema.parse(req.params);
      const response: ProjectDto = await this.getProjectUseCase.execute({
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
      const input: CreateProjectRequestDto = createProjectSchema.parse(
        req.body,
      );
      const response: ProjectDto = await this.createProjectUseCase.execute({
        ...input,
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
      const { id } = projectIdParamSchema.parse(req.params);
      const input: UpdateProjectRequestDto = updateProjectSchema.parse(
        req.body,
      );
      await this.updateProjectUseCase.execute({
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
      const { id } = projectIdParamSchema.parse(req.params);
      await this.deleteProjectUseCase.execute({
        id,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  getMembers = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const response: ProjectMemberDto[] =
        await this.getProjectMembersUseCase.execute({
          id,
          actorUserId: req.auth!.id,
        });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getAvailableUsers = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const response: ProjectMemberDto[] =
        await this.getAvailableUsersUseCase.execute({
          id,
          actorUserId: req.auth!.id,
        });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  addMember = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const { userId }: AddProjectMemberRequestDto =
        addProjectMemberSchema.parse(req.body);
      await this.addProjectMemberUseCase.execute({
        id,
        userId,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, userId }: ProjectMemberRequestDto =
        projectMemberParamSchema.parse(req.params);
      await this.removeProjectMemberUseCase.execute({
        id,
        userId,
        actorUserId: req.auth!.id,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
