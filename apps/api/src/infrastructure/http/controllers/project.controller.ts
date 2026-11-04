import type { Response } from "express";
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
import { actorId, type AuthedRequest } from "../middleware/auth.middleware.js";
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
  ): Promise<void> => {
    const response: ProjectDto[] = await this.getProjectListUseCase.execute({
      actorUserId: actorId(req),
    });
    res.status(200).json(response);
  };

  getById = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id } = projectIdParamSchema.parse(req.params);
    const response: ProjectDto = await this.getProjectUseCase.execute({
      id,
      actorUserId: actorId(req),
    });
    res.status(200).json(response);
  };

  create = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const input: CreateProjectRequestDto = createProjectSchema.parse(
      req.body,
    );
    const response: ProjectDto = await this.createProjectUseCase.execute({
      ...input,
      actorUserId: actorId(req),
    });
    res.status(201).json(response);
  };

  update = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id } = projectIdParamSchema.parse(req.params);
    const input: UpdateProjectRequestDto = updateProjectSchema.parse(
      req.body,
    );
    await this.updateProjectUseCase.execute({
      ...input,
      id,
      actorUserId: actorId(req),
    });
    res.status(204).end();
  };

  delete = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id } = projectIdParamSchema.parse(req.params);
    await this.deleteProjectUseCase.execute({
      id,
      actorUserId: actorId(req),
    });
    res.status(204).end();
  };

  getMembers = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id } = projectIdParamSchema.parse(req.params);
    const response: ProjectMemberDto[] =
      await this.getProjectMembersUseCase.execute({
        id,
        actorUserId: actorId(req),
      });
    res.status(200).json(response);
  };

  getAvailableUsers = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id } = projectIdParamSchema.parse(req.params);
    const response: ProjectMemberDto[] =
      await this.getAvailableUsersUseCase.execute({
        id,
        actorUserId: actorId(req),
      });
    res.status(200).json(response);
  };

  addMember = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id } = projectIdParamSchema.parse(req.params);
    const { userId }: AddProjectMemberRequestDto =
      addProjectMemberSchema.parse(req.body);
    await this.addProjectMemberUseCase.execute({
      id,
      userId,
      actorUserId: actorId(req),
    });
    res.status(204).end();
  };

  removeMember = async (
    req: AuthedRequest,
    res: Response,
  ): Promise<void> => {
    const { id, userId }: ProjectMemberRequestDto =
      projectMemberParamSchema.parse(req.params);
    await this.removeProjectMemberUseCase.execute({
      id,
      userId,
      actorUserId: actorId(req),
    });
    res.status(204).end();
  };
}
