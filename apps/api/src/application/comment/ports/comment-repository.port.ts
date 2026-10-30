import type { CommentDto, CommentRequestDto, IssueRequestDto } from "@orbit/shared";
import type { Comment } from "../../../domain/comment/comment.entity.js";
import type { ActorUserId } from "../../shared/actor.js";

export interface CommentRepository {
  save(comment: Comment, actorUserId: ActorUserId): Promise<number>;
  findAllByIssue(query: IssueRequestDto): Promise<CommentDto[]>;
  findDtoById(query: CommentRequestDto): Promise<CommentDto | null>;
  findById(query: CommentRequestDto): Promise<Comment | null>;
  update(comment: Comment, actorUserId: ActorUserId): Promise<void>;
  delete(query: CommentRequestDto): Promise<void>;
}
