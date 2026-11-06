import { describe, expect, it } from "vitest";
import type { AttachmentRepository } from "../../../src/application/attachment/ports/attachment-repository.port.js";
import type { CommentRepository } from "../../../src/application/comment/ports/comment-repository.port.js";
import { CreateCommentUseCase } from "../../../src/application/comment/use-cases/create-comment.use-case.js";
import { DeleteCommentUseCase } from "../../../src/application/comment/use-cases/delete-comment.use-case.js";
import { GetCommentsUseCase } from "../../../src/application/comment/use-cases/get-comments.use-case.js";
import { UpdateCommentUseCase } from "../../../src/application/comment/use-cases/update-comment.use-case.js";
import type { FileRepository } from "../../../src/application/file/ports/file-repository.port.js";
import type { FileStorage } from "../../../src/application/file/ports/file-storage.port.js";
import {
  CommentNotFoundError,
  NotCommentAuthorError,
} from "../../../src/domain/comment/comment.errors.js";
import { IssueNotFoundError } from "../../../src/domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { transactionDouble } from "../../support/doubles.js";
import { aComment, anIssue } from "../../support/fixtures.js";
import { issuesDouble, notificationsDouble, projectsDouble } from "../../support/issue-ports.js";
import { stub } from "../../support/stub.js";

const dto = {
  id: 20,
  issueId: 100,
  authorId: 1,
  authorName: "Ada Lovelace",
  authorAvatarUrl: null,
  body: "Looks good",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function commentsDouble(existing: ReturnType<typeof aComment> | null = aComment()) {
  return stub<CommentRepository>({
    save: async () => 20,
    findDtoById: async () => dto,
    findById: async () => existing,
    findAllByIssue: async () => [dto],
    update: async () => undefined,
    delete: async () => undefined,
  });
}

const ref = { id: 10, issueId: 100, commentId: 20, actorUserId: 1 };

describe("CreateCommentUseCase", () => {
  it("saves the trimmed comment as the actor and returns it", async () => {
    const comments = commentsDouble();

    const result = await new CreateCommentUseCase(
      projectsDouble(),
      issuesDouble(),
      comments,
      notificationsDouble(),
    ).execute({ id: 10, issueId: 100, body: "  Nice ", actorUserId: 3 });

    expect(result).toEqual(dto);
    const [saved, actor] = comments.save.mock.calls[0]!;
    expect(saved).toMatchObject({ body: "Nice", authorId: 3, issueId: 100 });
    expect(actor).toBe(3);
  });

  it("notifies the assignees and the reporter, so the author is not told about their own comment", async () => {
    const notifications = notificationsDouble();

    await new CreateCommentUseCase(
      projectsDouble(),
      issuesDouble(anIssue({ assigneeIds: [2, 3], reporterId: 1 })),
      commentsDouble(),
      notifications,
    ).execute({ id: 10, issueId: 100, body: "Hi", actorUserId: 3 });

    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientIds: [2, 3, 1],
        actorUserId: 3,
        type: "comment_added",
        entityType: "comment",
        entityId: 20,
        payload: expect.objectContaining({ issueKey: "WEB-7", issueTitle: "Fix login" }),
      }),
    );
  });

  it("fails when the issue does not exist", async () => {
    const issues = issuesDouble();
    issues.findById.mockResolvedValue(null);
    const comments = commentsDouble();

    await expect(
      new CreateCommentUseCase(projectsDouble(), issues, comments, notificationsDouble()).execute({
        id: 10,
        issueId: 1,
        body: "x",
        actorUserId: 1,
      }),
    ).rejects.toThrow(IssueNotFoundError);
    expect(comments.save).not.toHaveBeenCalled();
  });

  it("answers not found to people outside the project", async () => {
    await expect(
      new CreateCommentUseCase(
        projectsDouble(false),
        issuesDouble(),
        commentsDouble(),
        notificationsDouble(),
      ).execute({ id: 10, issueId: 100, body: "x", actorUserId: 9 }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("GetCommentsUseCase", () => {
  it("lists the comments of the issue", async () => {
    const result = await new GetCommentsUseCase(
      projectsDouble(),
      issuesDouble(),
      commentsDouble(),
    ).execute({ id: 10, issueId: 100, actorUserId: 1 });

    expect(result).toEqual([dto]);
  });

  it("fails when the issue does not exist", async () => {
    const issues = issuesDouble();
    issues.findById.mockResolvedValue(null);

    await expect(
      new GetCommentsUseCase(projectsDouble(), issues, commentsDouble()).execute({
        id: 10,
        issueId: 1,
        actorUserId: 1,
      }),
    ).rejects.toThrow(IssueNotFoundError);
  });
});

describe("UpdateCommentUseCase", () => {
  it("lets the author edit the comment", async () => {
    const comments = commentsDouble();

    await new UpdateCommentUseCase(projectsDouble(), comments).execute({ ...ref, body: " Edited " });

    const [saved] = comments.update.mock.calls[0]!;
    expect(saved.body).toBe("Edited");
  });

  it("does not let someone else edit it", async () => {
    const comments = commentsDouble();

    await expect(
      new UpdateCommentUseCase(projectsDouble(), comments).execute({ ...ref, actorUserId: 2, body: "x" }),
    ).rejects.toThrow(NotCommentAuthorError);
    expect(comments.update).not.toHaveBeenCalled();
  });

  it("fails when the comment does not exist", async () => {
    await expect(
      new UpdateCommentUseCase(projectsDouble(), commentsDouble(null)).execute({ ...ref, body: "x" }),
    ).rejects.toThrow(CommentNotFoundError);
  });
});

describe("DeleteCommentUseCase", () => {
  function setup(existing: ReturnType<typeof aComment> | null = aComment()) {
    const comments = commentsDouble(existing);
    const attachments = stub<AttachmentRepository>({
      findFilesByComment: async () => [
        { attachmentId: 1, fileId: 7, storageKey: "attachments/100/a.png", mimeType: "image/png", originalName: "a.png", commentId: 20 },
        { attachmentId: 2, fileId: 8, storageKey: "attachments/100/b.png", mimeType: "image/png", originalName: "b.png", commentId: 20 },
      ],
      deleteByComment: async () => undefined,
    });
    const files = stub<FileRepository>({ delete: async () => undefined });
    const storage = stub<FileStorage>({ delete: async () => undefined });

    return {
      comments,
      attachments,
      files,
      storage,
      useCase: new DeleteCommentUseCase(
        projectsDouble(),
        comments,
        attachments,
        files,
        storage,
        transactionDouble(),
      ),
    };
  }

  it("deletes the comment together with its attachments and their stored files", async () => {
    const { useCase, comments, attachments, files, storage } = setup();

    await useCase.execute(ref);

    expect(attachments.deleteByComment).toHaveBeenCalledWith({ commentId: 20 });
    expect(files.delete).toHaveBeenCalledWith({ id: 7 });
    expect(files.delete).toHaveBeenCalledWith({ id: 8 });
    expect(comments.delete).toHaveBeenCalledWith(ref);
    expect(storage.delete).toHaveBeenCalledWith("attachments/100/a.png");
    expect(storage.delete).toHaveBeenCalledWith("attachments/100/b.png");
  });

  it("still succeeds when a stored file cannot be removed from disk", async () => {
    const { useCase, storage } = setup();
    storage.delete.mockRejectedValue(new Error("disk error"));

    await expect(useCase.execute(ref)).resolves.toBeUndefined();
  });

  it("does not let someone else delete it", async () => {
    const { useCase, comments, files } = setup();

    await expect(useCase.execute({ ...ref, actorUserId: 2 })).rejects.toThrow(NotCommentAuthorError);
    expect(comments.delete).not.toHaveBeenCalled();
    expect(files.delete).not.toHaveBeenCalled();
  });

  it("fails when the comment does not exist", async () => {
    const { useCase } = setup(null);

    await expect(useCase.execute(ref)).rejects.toThrow(CommentNotFoundError);
  });
});
