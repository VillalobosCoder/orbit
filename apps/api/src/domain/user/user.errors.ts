import { DomainError } from "../shared/domain-error.js";

export class InvalidEmailError extends DomainError {
  readonly statusCode = 400;

  constructor(raw: string) {
    super("errors.user.invalidEmail", { raw });
  }
}

export class WeakPasswordError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.user.weakPassword");
  }
}

export class PasswordTooLongError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.user.passwordTooLong");
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(email: string) {
    super("errors.user.alreadyExists", { email });
  }
}

export class UserNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(id: number) {
    super("errors.user.notFound", { id });
  }
}

export class InvalidUserPermissionError extends DomainError {
  readonly statusCode = 400;

  constructor(module: string) {
    super("errors.user.invalidModule", { module });
  }
}

export class InitialAdminAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor() {
    super("errors.user.initialAdminExists");
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly statusCode = 401;
  
  constructor() {
    super("errors.user.invalidCredentials");
  }
}


export class PasswordPolicyError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.user.passwordPolicy");
  }
}

export class IncorrectCurrentPasswordError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.user.incorrectCurrentPassword");
  }
}

export class SamePasswordError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("errors.user.samePassword");
  }
}

export class CannotResetOwnPasswordError extends DomainError {
  readonly statusCode = 403;

  constructor() {
    super("errors.user.cannotResetOwnPassword");
  }
}

export class InvalidAvatarImageError extends DomainError {
  readonly statusCode = 415;

  constructor() {
    super("errors.user.invalidAvatar");
  }
}

export class AvatarTooLargeError extends DomainError {
  readonly statusCode = 413;

  constructor() {
    super("errors.user.avatarTooLarge");
  }
}

export class AvatarNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor() {
    super("errors.user.avatarNotFound");
  }
}

export class PermissionRequiresParentModuleError extends DomainError {
  readonly statusCode = 400;

  constructor(moduleName: string, parentName: string) {
    super("errors.user.permissionRequiresParent", {
      module: moduleName,
      parent: parentName,
    });
  }
}
