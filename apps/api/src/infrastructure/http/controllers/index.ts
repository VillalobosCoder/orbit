import type { PasswordHasher } from "../../../application/user/ports/password-hasher.port.js";
import type { UserRepository } from "../../../application/user/ports/user-repository.port.js";
import type { TokenService } from "../../../application/auth/ports/token-service.port.js";
import { LoginUseCase } from "../../../application/auth/use-cases/login.use-case.js";
import { GetCurrentUserUseCase } from "../../../application/auth/use-cases/get-current-user.use-case.js";
import { CreateUserUseCase } from "../../../application/user/use-cases/create-user.use-case.js";
import { DeleteUserUseCase } from "../../../application/user/use-cases/delete-user.use-case.js";
import { AuthController } from "./auth.controller.js";
import { UserController } from "./user.controller.js";
import { GetUserListUseCase } from "../../../application/user/use-cases/get-user-list.use-case.js";

export interface ControllerDependencies {
  userRepository: UserRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
}

export function createControllers(dependencies: ControllerDependencies) {
  const createUser = new CreateUserUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
  );
  const deleteUser = new DeleteUserUseCase(dependencies.userRepository);
  const getCurrentUser = new GetCurrentUserUseCase(dependencies.userRepository);
  const getAllUsers = new GetUserListUseCase(dependencies.userRepository);
  const login = new LoginUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.tokenService,
  );

  return {
    users: new UserController(getAllUsers, createUser, deleteUser),
    auth: new AuthController(login, getCurrentUser),
  };
}
