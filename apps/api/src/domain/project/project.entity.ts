import { NotProjectOwnerError } from "./project.errors.js";
import { ProjectKey } from "./value-objects/project-key.vo.js";

export type ProjectDetails = {
  name: string;
  description?: string | null;
};

export type ProjectPrimitives = {
  id: number;
  ownerUserId: number;
  projectKey: string;
  name: string;
  description: string | null;
};

type ProjectProps = {
  id?: number;
  ownerUserId: number;
  projectKey: ProjectKey;
  name: string;
  description: string | null;
};

export class Project {
  private constructor(private readonly props: Readonly<ProjectProps>) {}

  static register(
    input: ProjectDetails & { ownerUserId: number; projectKey: string },
  ): Project {
    return new Project({
      ownerUserId: input.ownerUserId,
      projectKey: ProjectKey.create(input.projectKey),
      ...Project.normalizeDetails(input),
    });
  }

  static fromPersistence(data: ProjectPrimitives): Project {
    return new Project({
      id: data.id,
      ownerUserId: data.ownerUserId,
      projectKey: ProjectKey.create(data.projectKey),
      name: data.name,
      description: data.description,
    });
  }

  private static normalizeDetails(input: ProjectDetails) {
    return {
      name: input.name.trim(),
      description: input.description?.trim() || null,
    };
  }

  withDetails(input: ProjectDetails): Project {
    return new Project({ ...this.props, ...Project.normalizeDetails(input) });
  }

  assertOwnedBy(userId: number): void {
    if (this.props.ownerUserId !== userId) {
      throw new NotProjectOwnerError();
    }
  }

  toPrimitives(): Omit<ProjectPrimitives, "id"> & { id?: number } {
    return {
      id: this.props.id,
      ownerUserId: this.props.ownerUserId,
      projectKey: this.props.projectKey.toString(),
      name: this.props.name,
      description: this.props.description,
    };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get ownerUserId(): number {
    return this.props.ownerUserId;
  }

  get projectKey(): string {
    return this.props.projectKey.toString();
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }
}
