import {
  NotificationType,
  type CommentDto,
  type IssueRequestDto,
  type SaveCommentRequestDto,
} from "@orbit/shared";
import { Comment } from "../../../domain/comment/comment.entity.js";
import { CommentNotFoundError } from "../../../domain/comment/comment.errors.js";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { CommentRepository } from "../ports/comment-repository.port.js";
import type { NotificationRepository } from "../../notification/ports/notification-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type CreateCommentInput = SaveCommentRequestDto &
  IssueRequestDto & Actor;

export class CreateCommentUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly comments: CommentRepository,
    private readonly notifications: NotificationRepository,
  ) {}

  async execute(input: CreateCommentInput): Promise<CommentDto> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const issue = await this.issues.findById(input);

    if (!issue) {
      throw new IssueNotFoundError(input.issueId);
    }

    const comment = Comment.register({
      issueId: input.issueId,
      authorId: input.actorUserId,
      body: input.body,
    });
    const commentId = await this.comments.save(comment, input.actorUserId);
    const created = await this.comments.findDtoById({ ...input, commentId });

    if (!created) {
      throw new CommentNotFoundError(commentId);
    }

    await this.notifications.notify({
      recipientIds: [...issue.assigneeIds, issue.reporterId],
      actorUserId: input.actorUserId,
      type: NotificationType.COMMENT_ADDED,
      entityType: "comment",
      entityId: commentId,
      payload: {
        projectId: input.id,
        issueId: input.issueId,
        issueKey: `${project.projectKey}-${issue.issueNumber}`,
        issueTitle: issue.title,
      },
    });

    return created;
  }
}
