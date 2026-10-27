import { SprintStatus } from "@orbit/shared";
import {
  InvalidSprintDatesError,
  InvalidSprintStateError,
} from "./sprint.errors.js";

export type SprintDetails = {
  name: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type SprintPrimitives = {
  id: number;
  projectId: number;
  name: string;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  status: SprintStatus;
};

type SprintProps = Omit<SprintPrimitives, "id"> & { id?: number };

export class Sprint {
  private constructor(private readonly props: Readonly<SprintProps>) {}

  static register(input: SprintDetails & { projectId: number }): Sprint {
    return new Sprint({
      projectId: input.projectId,
      status: SprintStatus.PLANNED,
      ...Sprint.normalizeDetails(input),
    });
  }

  static fromPersistence(data: SprintPrimitives): Sprint {
    return new Sprint({ ...data });
  }

  private static normalizeDetails(input: SprintDetails) {
    const startDate = input.startDate || null;
    const endDate = input.endDate || null;

    // Las fechas son `YYYY-MM-DD`: comparadas como texto, ordenan igual que como fechas.
    if (startDate && endDate && endDate < startDate) {
      throw new InvalidSprintDatesError();
    }

    return {
      name: input.name.trim(),
      goal: input.goal?.trim() || null,
      startDate,
      endDate,
    };
  }

  withDetails(input: SprintDetails): Sprint {
    if (this.props.status === SprintStatus.CLOSED) {
      throw new InvalidSprintStateError("Un sprint cerrado no se puede editar.");
    }

    return new Sprint({ ...this.props, ...Sprint.normalizeDetails(input) });
  }

  start(): Sprint {
    if (this.props.status !== SprintStatus.PLANNED) {
      throw new InvalidSprintStateError("Solo se puede iniciar un sprint planeado.");
    }

    return new Sprint({ ...this.props, status: SprintStatus.ACTIVE });
  }

  close(): Sprint {
    if (this.props.status !== SprintStatus.ACTIVE) {
      throw new InvalidSprintStateError("Solo se puede completar un sprint activo.");
    }

    return new Sprint({ ...this.props, status: SprintStatus.CLOSED });
  }

  assertDeletable(): void {
    if (this.props.status !== SprintStatus.PLANNED) {
      throw new InvalidSprintStateError(
        "Solo se puede eliminar un sprint que aún no empezó.",
      );
    }
  }

  assertAcceptsIssues(): void {
    if (this.props.status === SprintStatus.CLOSED) {
      throw new InvalidSprintStateError(
        "No se pueden asignar issues a un sprint cerrado.",
      );
    }
  }

  toPrimitives(): SprintProps {
    return { ...this.props };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get projectId(): number {
    return this.props.projectId;
  }

  get name(): string {
    return this.props.name;
  }

  get goal(): string | null {
    return this.props.goal;
  }

  get startDate(): string | null {
    return this.props.startDate;
  }

  get endDate(): string | null {
    return this.props.endDate;
  }

  get status(): SprintStatus {
    return this.props.status;
  }
}
