import { AddProjectMemberUseCase } from "../../../../application/project/use-cases/add-project-member.use-case.js";
import { CreateProjectUseCase } from "../../../../application/project/use-cases/create-project.use-case.js";
import { DeleteProjectUseCase } from "../../../../application/project/use-cases/delete-project.use-case.js";
import { GetAvailableUsersUseCase } from "../../../../application/project/use-cases/get-available-users.use-case.js";
import { GetProjectListUseCase } from "../../../../application/project/use-cases/get-project-list.use-case.js";
import { GetProjectMembersUseCase } from "../../../../application/project/use-cases/get-project-members.use-case.js";
import { GetProjectUseCase } from "../../../../application/project/use-cases/get-project.use-case.js";
import { ProjectController } from "../project.controller.js";
import { RemoveProjectMemberUseCase } from "../../../../application/project/use-cases/remove-project-member.use-case.js";
import { UpdateProjectUseCase } from "../../../../application/project/use-cases/update-project.use-case.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createProjectController(dependencies: ControllerDependencies) {
  return new ProjectController(
    new GetProjectListUseCase(dependencies.projectRepository),
    new GetProjectUseCase(dependencies.projectRepository),
    new CreateProjectUseCase(
      dependencies.projectRepository,
      dependencies.projectMemberRepository,
      dependencies.issueCatalogRepository,
      dependencies.transaction,
    ),
    new UpdateProjectUseCase(dependencies.projectRepository),
    new DeleteProjectUseCase(dependencies.projectRepository),
    new GetProjectMembersUseCase(
      dependencies.projectRepository,
      dependencies.projectMemberRepository,
    ),
    new GetAvailableUsersUseCase(
      dependencies.projectRepository,
      dependencies.projectMemberRepository,
    ),
    new AddProjectMemberUseCase(
      dependencies.projectRepository,
      dependencies.projectMemberRepository,
      dependencies.userRepository,
    ),
    new RemoveProjectMemberUseCase(
      dependencies.projectRepository,
      dependencies.projectMemberRepository,
    ),
  );
}
