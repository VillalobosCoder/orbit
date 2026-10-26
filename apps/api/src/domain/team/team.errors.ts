import { DomainError } from "../shared/domain-error.js";

export class TeamNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(id: number) {
    super(`No se encontró el equipo ${id}.`);
  }
}

export class TeamAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(name: string) {
    super(`Ya existe un equipo con el nombre "${name}".`);
  }
}
