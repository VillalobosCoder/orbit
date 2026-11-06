import { describe, expect, it } from "vitest";
import type { ProjectRepository } from "../../../src/application/project/ports/project-repository.port.js";
import { DeleteProjectUseCase } from "../../../src/application/project/use-cases/delete-project.use-case.js";
import {
  NotProjectOwnerError,
  ProjectNotFoundError,
} from "../../../src/domain/project/project.errors.js";
import { aProject } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

describe("DeleteProjectUseCase", () => {
  it("lets the owner delete the project", async () => {
    const projects = stub<ProjectRepository>({
      findByIdForMember: async () => aProject({ ownerUserId: 1 }),
      delete: async () => undefined,
    });

    await new DeleteProjectUseCase(projects).execute({ id: 10, actorUserId: 1 });

    expect(projects.delete).toHaveBeenCalledWith({ id: 10, actorUserId: 1 });
  });

  it("forbids a member who is not the owner", async () => {
    const projects = stub<ProjectRepository>({
      findByIdForMember: async () => aProject({ ownerUserId: 1 }),
    });

    await expect(
      new DeleteProjectUseCase(projects).execute({ id: 10, actorUserId: 2 }),
    ).rejects.toThrow(NotProjectOwnerError);
    expect(projects.delete).not.toHaveBeenCalled();
  });

  it("answers not found to someone outside the project", async () => {
    const projects = stub<ProjectRepository>({ findByIdForMember: async () => null });

    await expect(
      new DeleteProjectUseCase(projects).execute({ id: 10, actorUserId: 9 }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});
