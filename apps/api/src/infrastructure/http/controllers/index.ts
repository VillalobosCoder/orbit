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
import type { TeamRepository } from "../../../application/team/ports/team-repository.port.js";
import { CreateTeamUseCase } from "../../../application/team/use-cases/create-team.use-case.js";
import { DeleteTeamUseCase } from "../../../application/team/use-cases/delete-team.use-case.js";
import { GetTeamListUseCase } from "../../../application/team/use-cases/get-team-list.use-case.js";
import { GetTeamUseCase } from "../../../application/team/use-cases/get-team.use-case.js";
import { UpdateTeamUseCase } from "../../../application/team/use-cases/update-team.use-case.js";
import { TeamController } from "./team.controller.js";

export interface ControllerDependencies {
  userRepository: UserRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
  userPermissionRepository: UserPermissionRepository;
  moduleRepository: ModuleRepository;
  transaction: TransactionManager;
  teamRepository: TeamRepository;
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
    teams: new TeamController(
      new GetTeamListUseCase(dependencies.teamRepository),
      new GetTeamUseCase(dependencies.teamRepository),
      new CreateTeamUseCase(dependencies.teamRepository),
      new UpdateTeamUseCase(dependencies.teamRepository),
      new DeleteTeamUseCase(dependencies.teamRepository),
    ),
  };
}
