import { DomainError } from "../shared/domain-error.js";

export class BoardColumnNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(columnId: number) {
    super(`No se encontró la columna ${columnId}.`);
  }
}

export class BoardColumnNameAlreadyExistsError extends DomainError {
  readonly statusCode = 409;

  constructor(name: string) {
    super(`Ya existe una columna llamada "${name}" en este proyecto.`);
  }
}

export class InvalidBoardColumnOrderError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("El orden debe incluir cada columna del proyecto exactamente una vez.");
  }
}

export class InvalidBoardColumnTargetError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("Elige otra columna del proyecto para recibir los issues.");
  }
}

export class LastBoardColumnOfCategoryError extends DomainError {
  readonly statusCode = 409;

  constructor() {
    super(
      "El proyecto necesita al menos una columna 'Por hacer' y una 'Finalizada'.",
    );
  }
}
