import { CreateUserUseCase } from "../../../../application/user/use-cases/create-user.use-case.js";
import { DeleteUserUseCase } from "../../../../application/user/use-cases/delete-user.use-case.js";
import { GetAvatarUseCase } from "../../../../application/user/use-cases/get-avatar.use-case.js";
import { GetUserListUseCase } from "../../../../application/user/use-cases/get-user-list.use-case.js";
import { GetUserUseCase } from "../../../../application/user/use-cases/get-user.use-case.js";
import { ResetUserPasswordUseCase } from "../../../../application/user/use-cases/reset-user-password.use-case.js";
import { UpdateUserUseCase } from "../../../../application/user/use-cases/update-user.use-case.js";
import { UserController } from "../user.controller.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createUserController(dependencies: ControllerDependencies) {
  const createUser = new CreateUserUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.userPermissionRepository,
    dependencies.transaction,
  );
  const deleteUser = new DeleteUserUseCase(dependencies.userRepository);
  const getUser = new GetUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
  );
  const updateUser = new UpdateUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
    dependencies.transaction,
  );
  const resetUserPassword = new ResetUserPasswordUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
  );
  const getAllUsers = new GetUserListUseCase(dependencies.userRepository);

  return new UserController(
    getAllUsers,
    createUser,
    deleteUser,
    getUser,
    updateUser,
    resetUserPassword,
    new GetAvatarUseCase(
      dependencies.userRepository,
      dependencies.fileRepository,
      dependencies.fileStorage,
    ),
  );
}
