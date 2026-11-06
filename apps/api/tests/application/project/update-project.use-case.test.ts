import { describe, expect, it } from "vitest";
import type { ProjectRepository } from "../../../src/application/project/ports/project-repository.port.js";
import { UpdateProjectUseCase } from "../../../src/application/project/use-cases/update-project.use-case.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { aProject } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

describe("UpdateProjectUseCase", () => {
  it("updates name and description of a project the user belongs to", async () => {
    const projects = stub<ProjectRepository>({
      findByIdForMember: async () => aProject(),
      update: async () => undefined,
    });

    await new UpdateProjectUseCase(projects).execute({
      id: 10,
      name: "  Renamed ",
      description: "New",
      actorUserId: 3,
    });

    const [saved, actor] = projects.update.mock.calls[0]!;
    expect(saved).toMatchObject({ name: "Renamed", description: "New", projectKey: "WEB" });
    expect(actor).toBe(3);
  });

  it("does not touch projects the user cannot see", async () => {
    const projects = stub<ProjectRepository>({ findByIdForMember: async () => null });

    await expect(
      new UpdateProjectUseCase(projects).execute({ id: 10, name: "x", actorUserId: 3 }),
    ).rejects.toThrow(ProjectNotFoundError);
    expect(projects.update).not.toHaveBeenCalled();
  });
});
