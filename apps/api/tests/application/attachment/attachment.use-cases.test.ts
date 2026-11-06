import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import type { AttachmentDto } from "@orbit/shared";
import type { AttachmentRepository } from "../../../src/application/attachment/ports/attachment-repository.port.js";
import { DeleteAttachmentUseCase } from "../../../src/application/attachment/use-cases/delete-attachment.use-case.js";
import { GetAttachmentContentUseCase } from "../../../src/application/attachment/use-cases/get-attachment-content.use-case.js";
import { GetAttachmentsUseCase } from "../../../src/application/attachment/use-cases/get-attachments.use-case.js";
import { UploadAttachmentUseCase } from "../../../src/application/attachment/use-cases/upload-attachment.use-case.js";
import type { CommentRepository } from "../../../src/application/comment/ports/comment-repository.port.js";
import type { FileRepository } from "../../../src/application/file/ports/file-repository.port.js";
import type { FileStorage } from "../../../src/application/file/ports/file-storage.port.js";
import {
  AttachmentNotFoundError,
  AttachmentTooLargeError,
  InvalidAttachmentError,
  TooManyAttachmentsError,
} from "../../../src/domain/attachment/attachment.errors.js";
import {
  CommentNotFoundError,
  NotCommentAuthorError,
} from "../../../src/domain/comment/comment.errors.js";
import { IssueNotFoundError } from "../../../src/domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { transactionDouble } from "../../support/doubles.js";
import { aComment } from "../../support/fixtures.js";
import { issuesDouble, projectsDouble } from "../../support/issue-ports.js";
import { bytes, MP4_HEADER, PNG_HEADER } from "../../support/media.js";
import { stub } from "../../support/stub.js";

const dto: AttachmentDto = {
  id: 1,
  issueId: 100,
  commentId: null,
  kind: "image",
  mimeType: "image/png",
  originalName: "shot.png",
  sizeBytes: 32,
  width: null,
  height: null,
  durationSeconds: null,
  uploadedByName: "Ada Lovelace",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function attachmentsDouble(count = 0) {
  return stub<AttachmentRepository>({
    countByTarget: async () => count,
    create: async () => 1,
    findDtoById: async () => dto,
    findAllByIssue: async () => [dto],
    findFileById: async () => ({
      attachmentId: 1,
      fileId: 7,
      storageKey: "attachments/100/a.png",
      mimeType: "image/png",
      originalName: "shot.png",
      commentId: null,
    }),
    delete: async () => undefined,
  });
}

function uploadSetup({ count = 0, comment = aComment() as ReturnType<typeof aComment> | null } = {}) {
  const attachments = attachmentsDouble(count);
  const files = stub<FileRepository>({ create: async () => 7 });
  const storage = stub<FileStorage>({ save: async () => undefined, delete: async () => undefined });
  const comments = stub<CommentRepository>({ findById: async () => comment });

  return {
    attachments,
    files,
    storage,
    comments,
    useCase: new UploadAttachmentUseCase(
      projectsDouble(),
      issuesDouble(),
      comments,
      attachments,
      files,
      storage,
      transactionDouble(),
    ),
  };
}

const upload = {
  id: 10,
  issueId: 100,
  commentId: null,
  actorUserId: 1,
  content: bytes(PNG_HEADER),
  originalName: "shot.png",
};

describe("UploadAttachmentUseCase", () => {
  it("stores the file, records it with its measures and links it to the issue", async () => {
    const { useCase, files, storage, attachments } = uploadSetup();

    const result = await useCase.execute({ ...upload, width: 640, height: 480 });

    expect(result).toEqual(dto);
    expect(storage.save).toHaveBeenCalledTimes(1);
    expect(files.create).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "attachments",
        mimeType: "image/png",
        originalName: "shot.png",
        width: 640,
        height: 480,
        actorUserId: 1,
      }),
    );
    expect(attachments.create).toHaveBeenCalledWith(
      expect.objectContaining({ issueId: 100, commentId: null, fileId: 7 }),
    );
  });

  it("accepts videos", async () => {
    const { useCase, files } = uploadSetup();

    await useCase.execute({ ...upload, content: bytes(MP4_HEADER), originalName: "clip.mp4" });

    expect(files.create).toHaveBeenCalledWith(expect.objectContaining({ mimeType: "video/mp4" }));
  });

  it("rejects files that are not images or videos before touching anything", async () => {
    const { useCase, storage, files } = uploadSetup();

    await expect(
      useCase.execute({ ...upload, content: Buffer.from("<script>alert(1)</script>") }),
    ).rejects.toThrow(InvalidAttachmentError);
    expect(storage.save).not.toHaveBeenCalled();
    expect(files.create).not.toHaveBeenCalled();
  });

  it("rejects an image over 5 MB", async () => {
    const { useCase } = uploadSetup();

    await expect(
      useCase.execute({ ...upload, content: bytes(PNG_HEADER, 5 * 1024 * 1024 + 1) }),
    ).rejects.toThrow(AttachmentTooLargeError);
  });

  it("limits an issue to 10 attachments", async () => {
    const { useCase, storage } = uploadSetup({ count: 10 });

    await expect(useCase.execute(upload)).rejects.toThrow(TooManyAttachmentsError);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it("limits a comment to 4 attachments", async () => {
    const { useCase } = uploadSetup({ count: 4 });

    await expect(useCase.execute({ ...upload, commentId: 20 })).rejects.toThrow(
      TooManyAttachmentsError,
    );
  });

  it("lets only the author of a comment attach files to it", async () => {
    const { useCase } = uploadSetup({ comment: aComment({ authorId: 1 }) });

    await expect(useCase.execute({ ...upload, commentId: 20, actorUserId: 2 })).rejects.toThrow(
      NotCommentAuthorError,
    );
    await expect(useCase.execute({ ...upload, commentId: 20, actorUserId: 1 })).resolves.toEqual(dto);
  });

  it("fails when the comment does not belong to the issue", async () => {
    const { useCase } = uploadSetup({ comment: null });

    await expect(useCase.execute({ ...upload, commentId: 20 })).rejects.toThrow(
      CommentNotFoundError,
    );
  });

  it("fails when the issue does not exist", async () => {
    const { attachments, files, storage, comments } = uploadSetup();
    const issues = issuesDouble();
    issues.findById.mockResolvedValue(null);

    await expect(
      new UploadAttachmentUseCase(
        projectsDouble(),
        issues,
        comments,
        attachments,
        files,
        storage,
        transactionDouble(),
      ).execute(upload),
    ).rejects.toThrow(IssueNotFoundError);
  });

  it("answers not found to people outside the project", async () => {
    const { attachments, files, storage, comments } = uploadSetup();

    await expect(
      new UploadAttachmentUseCase(
        projectsDouble(false),
        issuesDouble(),
        comments,
        attachments,
        files,
        storage,
        transactionDouble(),
      ).execute(upload),
    ).rejects.toThrow(ProjectNotFoundError);
  });

  it("removes the stored file again when the database write fails", async () => {
    const { useCase, storage, files } = uploadSetup();
    files.create.mockRejectedValue(new Error("database down"));

    await expect(useCase.execute(upload)).rejects.toThrow("database down");

    expect(storage.delete).toHaveBeenCalledTimes(1);
  });
});

describe("GetAttachmentsUseCase", () => {
  it("lists every attachment of the issue", async () => {
    const result = await new GetAttachmentsUseCase(
      projectsDouble(),
      issuesDouble(),
      attachmentsDouble(),
    ).execute({ id: 10, issueId: 100, actorUserId: 1 });

    expect(result).toEqual([dto]);
  });

  it("fails when the issue does not exist", async () => {
    const issues = issuesDouble();
    issues.findById.mockResolvedValue(null);

    await expect(
      new GetAttachmentsUseCase(projectsDouble(), issues, attachmentsDouble()).execute({
        id: 10,
        issueId: 1,
        actorUserId: 1,
      }),
    ).rejects.toThrow(IssueNotFoundError);
  });
});

describe("GetAttachmentContentUseCase", () => {
  const ref = { id: 10, issueId: 100, attachmentId: 1, actorUserId: 1 };

  it("returns size, type and a reader for the stored file", async () => {
    const storage = stub<FileStorage>({
      size: async () => 24,
      openRead: () => Readable.from([Buffer.from("png")]),
    });

    const result = await new GetAttachmentContentUseCase(
      projectsDouble(),
      attachmentsDouble(),
      storage,
    ).execute(ref);

    expect(result).toMatchObject({ size: 24, mimeType: "image/png", originalName: "shot.png" });
    result.open({ start: 0, end: 9 });
    expect(storage.openRead).toHaveBeenCalledWith("attachments/100/a.png", { start: 0, end: 9 });
  });

  it("fails when the file is missing from storage", async () => {
    const storage = stub<FileStorage>({ size: async () => null });

    await expect(
      new GetAttachmentContentUseCase(projectsDouble(), attachmentsDouble(), storage).execute(ref),
    ).rejects.toThrow(AttachmentNotFoundError);
  });

  it("fails when the attachment is not in that issue", async () => {
    const attachments = attachmentsDouble();
    attachments.findFileById.mockResolvedValue(null);

    await expect(
      new GetAttachmentContentUseCase(projectsDouble(), attachments, stub<FileStorage>({})).execute(ref),
    ).rejects.toThrow(AttachmentNotFoundError);
  });

  it("answers not found to people outside the project", async () => {
    await expect(
      new GetAttachmentContentUseCase(projectsDouble(false), attachmentsDouble(), stub<FileStorage>({})).execute(ref),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("DeleteAttachmentUseCase", () => {
  const ref = { id: 10, issueId: 100, attachmentId: 1, commentId: null, actorUserId: 1 };

  function setup(comment: ReturnType<typeof aComment> | null = aComment()) {
    const attachments = attachmentsDouble();
    const files = stub<FileRepository>({ delete: async () => undefined });
    const storage = stub<FileStorage>({ delete: async () => undefined });
    const comments = stub<CommentRepository>({ findById: async () => comment });

    return {
      attachments,
      files,
      storage,
      useCase: new DeleteAttachmentUseCase(
        projectsDouble(),
        comments,
        attachments,
        files,
        storage,
        transactionDouble(),
      ),
    };
  }

  it("removes the link, the file record and the stored file", async () => {
    const { useCase, attachments, files, storage } = setup();

    await useCase.execute(ref);

    expect(attachments.delete).toHaveBeenCalledWith(ref);
    expect(files.delete).toHaveBeenCalledWith({ id: 7 });
    expect(storage.delete).toHaveBeenCalledWith("attachments/100/a.png");
  });

  it("fails when the attachment is not in that scope", async () => {
    const { useCase, attachments, files } = setup();
    attachments.findFileById.mockResolvedValue(null);

    await expect(useCase.execute(ref)).rejects.toThrow(AttachmentNotFoundError);
    expect(files.delete).not.toHaveBeenCalled();
  });

  it("lets only the author of a comment remove its attachments", async () => {
    const { useCase, attachments } = setup(aComment({ authorId: 1 }));

    await expect(useCase.execute({ ...ref, commentId: 20, actorUserId: 2 })).rejects.toThrow(
      NotCommentAuthorError,
    );
    expect(attachments.delete).not.toHaveBeenCalled();
    await expect(useCase.execute({ ...ref, commentId: 20, actorUserId: 1 })).resolves.toBeUndefined();
  });

  it("still succeeds when the stored file cannot be removed from disk", async () => {
    const { useCase, storage } = setup();
    storage.delete.mockRejectedValue(new Error("disk error"));

    await expect(useCase.execute(ref)).resolves.toBeUndefined();
  });
});
