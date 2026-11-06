import { describe, expect, it } from "vitest";
import type { IssueCatalogRepository } from "../../../src/application/issue/ports/issue-catalog-repository.port.js";
import type { ProjectMemberRepository } from "../../../src/application/project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../../src/application/project/ports/project-repository.port.js";
import { CreateProjectUseCase } from "../../../src/application/project/use-cases/create-project.use-case.js";
import { InvalidProjectKeyError } from "../../../src/domain/project/project.errors.js";
import { transactionDouble } from "../../support/doubles.js";
import { stub } from "../../support/stub.js";

function setup() {
  const projects = stub<ProjectRepository>({ save: async () => 99 });
  const members = stub<ProjectMemberRepository>({ add: async () => undefined });
  const catalog = stub<IssueCatalogRepository>({ seedDefaults: async () => undefined });

  return {
    projects,
    members,
    catalog,
    useCase: new CreateProjectUseCase(projects, members, catalog, transactionDouble()),
  };
}

const input = { name: "Website", projectKey: "web", description: "Site", actorUserId: 7 };

describe("CreateProjectUseCase", () => {
  it("creates the project owned by the actor and returns it", async () => {
    const { useCase, projects } = setup();

    const result = await useCase.execute(input);

    expect(result).toEqual({
      id: 99,
      ownerUserId: 7,
      projectKey: "WEB",
      name: "Website",
      description: "Site",
    });
    expect(projects.save).toHaveBeenCalledTimes(1);
  });

  it("makes the owner the first member of the project", async () => {
    const { useCase, members } = setup();

    await useCase.execute(input);

    expect(members.add).toHaveBeenCalledWith({ id: 99, userId: 7, actorUserId: 7 });
  });

  it("seeds the default board columns, issue types and catalogs", async () => {
    const { useCase, catalog } = setup();

    await useCase.execute(input);

    expect(catalog.seedDefaults).toHaveBeenCalledWith({ id: 99, actorUserId: 7 });
  });

  it("rejects an invalid key before writing anything", async () => {
    const { useCase, projects } = setup();

    await expect(useCase.execute({ ...input, projectKey: "1x" })).rejects.toThrow(
      InvalidProjectKeyError,
    );
    expect(projects.save).not.toHaveBeenCalled();
  });
});
