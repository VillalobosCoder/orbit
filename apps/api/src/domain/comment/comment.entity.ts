import { NotCommentAuthorError } from "./comment.errors.js";

export type CommentPrimitives = {
  id: number;
  issueId: number;
  authorId: number;
  body: string;
};

type CommentProps = Omit<CommentPrimitives, "id"> & { id?: number };

export class Comment {
  private constructor(private readonly props: Readonly<CommentProps>) {}

  static register(input: {
    issueId: number;
    authorId: number;
    body: string;
  }): Comment {
    return new Comment({
      issueId: input.issueId,
      authorId: input.authorId,
      body: input.body.trim(),
    });
  }

  static fromPersistence(data: CommentPrimitives): Comment {
    return new Comment({ ...data });
  }

  withBody(body: string): Comment {
    return new Comment({ ...this.props, body: body.trim() });
  }

  assertWrittenBy(userId: number): void {
    if (this.props.authorId !== userId) {
      throw new NotCommentAuthorError();
    }
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get issueId(): number {
    return this.props.issueId;
  }

  get authorId(): number {
    return this.props.authorId;
  }

  get body(): string {
    return this.props.body;
  }
}
