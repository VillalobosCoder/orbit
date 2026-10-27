import type { IssueRequestDto } from "../issues/issues.dto.js";

export type CommentDto = {
  id: number;
  issueId: number;
  authorId: number;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveCommentRequestDto = {
  body: string;
};

export type CommentRequestDto = IssueRequestDto & {
  commentId: number;
};
