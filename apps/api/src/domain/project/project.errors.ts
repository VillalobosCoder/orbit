import { DomainError } from "../shared/domain-error.js";

export class InvalidProjectKeyError extends DomainError {
  readonly statusCode = 400;

  constructor(raw: string) {
    super(
      `La clave "${raw}" no es válida: usa de 2 a 10 caracteres, letras mayúsculas o números, empezando por una letra.`,
    );
  }
}

export class ProjectNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(id: number) {
    super(`No se encontró el proyecto ${id}.`);
  }
}

export class ProjectKeyAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(projectKey: string) {
    super(`Ya tienes un proyecto con la clave ${projectKey}.`);
  }
}

export class NotProjectOwnerError extends DomainError {
  readonly statusCode = 403;

  constructor() {
    super("Solo el propietario del proyecto puede realizar esta acción.");
  }
}

export class ProjectMemberAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor() {
    super("El usuario ya es miembro del proyecto.");
  }
}

export class ProjectMemberNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(userId: number) {
    super(`El usuario ${userId} no es miembro del proyecto.`);
  }
}

export class CannotRemoveProjectOwnerError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("No puedes quitar al propietario del proyecto.");
  }
}
