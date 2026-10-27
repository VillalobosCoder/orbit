export type IssueDetails = {
  title: string;
  description?: string | null;
  typeId: number;
  priorityId?: number | null;
};

export type IssuePrimitives = {
  id: number;
  projectId: number;
  issueNumber: number;
  typeId: number;
  priorityId: number | null;
  columnId: number;
  reporterId: number;
  title: string;
  description: string | null;
  boardPosition: number;
  resolvedAt: Date | null;
  assigneeIds: number[];
};

type IssueProps = Omit<IssuePrimitives, "id"> & { id?: number };

export type RegisterIssueInput = IssueDetails & {
  projectId: number;
  issueNumber: number;
  columnId: number;
  reporterId: number;
  boardPosition: number;
  assigneeIds: number[];
  isDone: boolean;
};

export class Issue {
  private constructor(private readonly props: Readonly<IssueProps>) {}

  static register(input: RegisterIssueInput): Issue {
    return new Issue({
      projectId: input.projectId,
      issueNumber: input.issueNumber,
      columnId: input.columnId,
      reporterId: input.reporterId,
      boardPosition: input.boardPosition,
      assigneeIds: input.assigneeIds,
      resolvedAt: input.isDone ? new Date() : null,
      ...Issue.normalizeDetails(input),
    });
  }

  static fromPersistence(data: IssuePrimitives): Issue {
    return new Issue({ ...data });
  }

  private static normalizeDetails(input: IssueDetails) {
    return {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      typeId: input.typeId,
      priorityId: input.priorityId ?? null,
    };
  }

  withDetails(input: IssueDetails): Issue {
    return new Issue({ ...this.props, ...Issue.normalizeDetails(input) });
  }

  withAssignees(assigneeIds: number[]): Issue {
    return new Issue({ ...this.props, assigneeIds });
  }

  movedTo(input: {
    columnId: number;
    boardPosition: number;
    isDone: boolean;
  }): Issue {
    return new Issue({
      ...this.props,
      columnId: input.columnId,
      boardPosition: input.boardPosition,
      resolvedAt: input.isDone ? (this.props.resolvedAt ?? new Date()) : null,
    });
  }

  toPrimitives(): IssueProps {
    return { ...this.props };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get projectId(): number {
    return this.props.projectId;
  }

  get issueNumber(): number {
    return this.props.issueNumber;
  }

  get typeId(): number {
    return this.props.typeId;
  }

  get priorityId(): number | null {
    return this.props.priorityId;
  }

  get columnId(): number {
    return this.props.columnId;
  }

  get reporterId(): number {
    return this.props.reporterId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null {
    return this.props.description;
  }

  get boardPosition(): number {
    return this.props.boardPosition;
  }

  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }

  get assigneeIds(): number[] {
    return this.props.assigneeIds;
  }
}
