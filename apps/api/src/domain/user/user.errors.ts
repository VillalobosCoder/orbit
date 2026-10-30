import { DomainError } from "../shared/domain-error.js";

export class InvalidEmailError extends DomainError {
  readonly statusCode = 400;

  constructor(raw: string) {
    super(`El correo "${raw}" no tiene un formato válido.`);
  }
}

export class WeakPasswordError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("La contraseña debe tener al menos 8 caracteres.");
  }
}

export class PasswordTooLongError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("La contraseña no puede superar 1024 bytes.");
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(email: string) {
    super(`Ya existe un usuario con el correo ${email}.`);
  }
}

export class UserNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(id: number) {
    super(`No se encontró el usuario ${id}.`);
  }
}

export class InvalidUserPermissionError extends DomainError {
  readonly statusCode = 400;

  constructor(module: string) {
    super(`El módulo "${module}" no existe.`);
  }
}

export class InitialAdminAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor() {
    super("El administrador inicial solo puede configurarse si no existen usuarios.");
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly statusCode = 401;
  
  constructor() {
    super("Correo o contraseña incorrectos.");
  }
}


export class PasswordPolicyError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super(
      "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.",
    );
  }
}

export class IncorrectCurrentPasswordError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("La contraseña actual no es correcta.");
  }
}

export class SamePasswordError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("La contraseña nueva debe ser distinta de la actual.");
  }
}

export class CannotResetOwnPasswordError extends DomainError {
  readonly statusCode = 403;

  constructor() {
    super("No puedes restablecer tu propia contraseña; cámbiala desde tu perfil.");
  }
}
