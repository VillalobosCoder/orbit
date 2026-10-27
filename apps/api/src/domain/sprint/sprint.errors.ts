import { DomainError } from "../shared/domain-error.js";

export class SprintNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(sprintId: number) {
    super(`No se encontró el sprint ${sprintId}.`);
  }
}

export class InvalidSprintDatesError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("La fecha de fin no puede ser anterior a la de inicio.");
  }
}

export class InvalidSprintStateError extends DomainError {
  readonly statusCode = 409;

  constructor(message: string) {
    super(message);
  }
}

export class SprintNameAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(name: string) {
    super(`Ya existe un sprint llamado "${name}" en este proyecto.`);
  }
}

export class ActiveSprintAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor() {
    super("El proyecto ya tiene un sprint activo. Complétalo antes de iniciar otro.");
  }
}
