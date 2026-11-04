import { AuthController } from "../auth.controller.js";
import { ChangePasswordUseCase } from "../../../../application/auth/use-cases/change-password.use-case.js";
import { GetCurrentUserUseCase } from "../../../../application/auth/use-cases/get-current-user.use-case.js";
import { LoginUseCase } from "../../../../application/auth/use-cases/login.use-case.js";
import { RemoveAvatarUseCase } from "../../../../application/user/use-cases/remove-avatar.use-case.js";
import { UpdateProfileUseCase } from "../../../../application/auth/use-cases/update-profile.use-case.js";
import { UploadAvatarUseCase } from "../../../../application/user/use-cases/upload-avatar.use-case.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createAuthController(dependencies: ControllerDependencies) {
  const getCurrentUser = new GetCurrentUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
  );
  const changePassword = new ChangePasswordUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.tokenService,
  );
  const login = new LoginUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.tokenService,
    dependencies.userPermissionRepository,
  );

  return new AuthController(
    login,
    getCurrentUser,
    changePassword,
    new UpdateProfileUseCase(dependencies.userRepository),
    new UploadAvatarUseCase(
      dependencies.userRepository,
      dependencies.fileRepository,
      dependencies.fileStorage,
      dependencies.transaction,
    ),
    new RemoveAvatarUseCase(
      dependencies.userRepository,
      dependencies.fileRepository,
      dependencies.fileStorage,
      dependencies.transaction,
    ),
  );
}
