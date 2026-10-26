import type { PasswordHasher } from "../../../application/user/ports/password-hasher.port.js";
import type { UserRepository } from "../../../application/user/ports/user-repository.port.js";
import type { TokenService } from "../../../application/auth/ports/token-service.port.js";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { TransactionManager } from "../../../application/shared/ports/transaction-manager.port.js";
import type { ModuleRepository } from "../../../application/modules/ports/module-repository.port.js";
import { LoginUseCase } from "../../../application/auth/use-cases/login.use-case.js";
import { GetCurrentUserUseCase } from "../../../application/auth/use-cases/get-current-user.use-case.js";
import { CreateUserUseCase } from "../../../application/user/use-cases/create-user.use-case.js";
import { DeleteUserUseCase } from "../../../application/user/use-cases/delete-user.use-case.js";
import { AuthController } from "./auth.controller.js";
import { UserController } from "./user.controller.js";
import { GetUserListUseCase } from "../../../application/user/use-cases/get-user-list.use-case.js";
import { GetUserUseCase } from "../../../application/user/use-cases/get-user.use-case.js";
import { UpdateUserUseCase } from "../../../application/user/use-cases/update-user.use-case.js";
import { ModuleController } from "./module.controller.js";
import type { ProjectMemberRepository } from "../../../application/project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../../application/project/ports/project-repository.port.js";
import { AddProjectMemberUseCase } from "../../../application/project/use-cases/add-project-member.use-case.js";
import { CreateProjectUseCase } from "../../../application/project/use-cases/create-project.use-case.js";
import { DeleteProjectUseCase } from "../../../application/project/use-cases/delete-project.use-case.js";
import { GetAvailableUsersUseCase } from "../../../application/project/use-cases/get-available-users.use-case.js";
import { GetProjectListUseCase } from "../../../application/project/use-cases/get-project-list.use-case.js";
import { GetProjectMembersUseCase } from "../../../application/project/use-cases/get-project-members.use-case.js";
import { GetProjectUseCase } from "../../../application/project/use-cases/get-project.use-case.js";
import { RemoveProjectMemberUseCase } from "../../../application/project/use-cases/remove-project-member.use-case.js";
import { UpdateProjectUseCase } from "../../../application/project/use-cases/update-project.use-case.js";
import { ProjectController } from "./project.controller.js";

export interface ControllerDependencies {
  userRepository: UserRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
  userPermissionRepository: UserPermissionRepository;
  moduleRepository: ModuleRepository;
  transaction: TransactionManager;
  projectRepository: ProjectRepository;
  projectMemberRepository: ProjectMemberRepository;
}

export function createControllers(dependencies: ControllerDependencies) {
  const createUser = new CreateUserUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.userPermissionRepository,
    dependencies.transaction,
  );
  const deleteUser = new DeleteUserUseCase(dependencies.userRepository);
  const getCurrentUser = new GetCurrentUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
  );
  const getUser = new GetUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
  );
  const updateUser = new UpdateUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
    dependencies.transaction,
  );
  const getAllUsers = new GetUserListUseCase(dependencies.userRepository);
  const login = new LoginUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.tokenService,
    dependencies.userPermissionRepository,
  );

  return {
    users: new UserController(
      getAllUsers,
      createUser,
      deleteUser,
      getUser,
      updateUser,
    ),
    auth: new AuthController(login, getCurrentUser),
    modules: new ModuleController(dependencies.moduleRepository),
    projects: new ProjectController(
      new GetProjectListUseCase(dependencies.projectRepository),
      new GetProjectUseCase(dependencies.projectRepository),
      new CreateProjectUseCase(
        dependencies.projectRepository,
        dependencies.projectMemberRepository,
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
    ),
  };
}
