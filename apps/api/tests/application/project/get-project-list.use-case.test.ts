import { describe, expect, it } from "vitest";
import type { ProjectRepository } from "../../../src/application/project/ports/project-repository.port.js";
import { GetProjectListUseCase } from "../../../src/application/project/use-cases/get-project-list.use-case.js";
import { aProject } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

describe("GetProjectListUseCase", () => {
  it("lists only the projects of the acting user", async () => {
    const projects = stub<ProjectRepository>({
      findAllByMember: async () => [aProject(), aProject({ id: 11, projectKey: "API" })],
    });

    const result = await new GetProjectListUseCase(projects).execute({ actorUserId: 4 });

    expect(projects.findAllByMember).toHaveBeenCalledWith(4);
    expect(result.map((project) => project.projectKey)).toEqual(["WEB", "API"]);
  });

  it("returns an empty list when the user has no projects", async () => {
    const projects = stub<ProjectRepository>({ findAllByMember: async () => [] });

    await expect(
      new GetProjectListUseCase(projects).execute({ actorUserId: 4 }),
    ).resolves.toEqual([]);
  });
});
