import { describe, expect, it } from "vitest";
import type { ProjectRepository } from "../../../src/application/project/ports/project-repository.port.js";
import { GetProjectUseCase } from "../../../src/application/project/use-cases/get-project.use-case.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { aProject } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

describe("GetProjectUseCase", () => {
  it("returns the project to a member", async () => {
    const projects = stub<ProjectRepository>({ findByIdForMember: async () => aProject() });

    const result = await new GetProjectUseCase(projects).execute({ id: 10, actorUserId: 1 });

    expect(result).toMatchObject({ id: 10, projectKey: "WEB", ownerUserId: 1 });
  });

  it("hides the project from people who are not members", async () => {
    const projects = stub<ProjectRepository>({ findByIdForMember: async () => null });

    await expect(
      new GetProjectUseCase(projects).execute({ id: 10, actorUserId: 2 }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});
