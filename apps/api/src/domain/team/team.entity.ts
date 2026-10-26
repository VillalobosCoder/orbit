export type TeamDetails = {
  name: string;
  description?: string | null;
};

export type TeamPrimitives = {
  id: number;
  ownerUserId: number;
  name: string;
  description: string | null;
};

type TeamProps = {
  id?: number;
  ownerUserId: number;
  name: string;
  description: string | null;
};

export class Team {
  private constructor(private readonly props: Readonly<TeamProps>) {}

  static register(input: TeamDetails & { ownerUserId: number }): Team {
    return new Team({
      ownerUserId: input.ownerUserId,
      ...Team.normalizeDetails(input),
    });
  }

  static fromPersistence(data: TeamPrimitives): Team {
    return new Team({ ...data });
  }

  private static normalizeDetails(input: TeamDetails) {
    return {
      name: input.name.trim(),
      description: input.description?.trim() || null,
    };
  }

  withDetails(input: TeamDetails): Team {
    return new Team({ ...this.props, ...Team.normalizeDetails(input) });
  }

  toPrimitives(): Omit<TeamPrimitives, "id"> & { id?: number } {
    return { ...this.props };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get ownerUserId(): number {
    return this.props.ownerUserId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }
}
