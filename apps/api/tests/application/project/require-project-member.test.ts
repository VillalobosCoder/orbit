import { describe, expect, it } from "vitest";
import type { ProjectRepository } from "../../../src/application/project/ports/project-repository.port.js";
import { requireProjectMember } from "../../../src/application/project/utils/require-project-member.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { aProject } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

describe("requireProjectMember", () => {
  it("returns the project when the user is a member", async () => {
    const projects = stub<ProjectRepository>({ findByIdForMember: async () => aProject() });

    const project = await requireProjectMember(projects, 10, 5);

    expect(project.name).toBe("Website");
    expect(projects.findByIdForMember).toHaveBeenCalledWith({ id: 10, userId: 5 });
  });

  it("answers 'not found' when the user is not a member, so the project stays hidden", async () => {
    const projects = stub<ProjectRepository>({ findByIdForMember: async () => null });

    await expect(requireProjectMember(projects, 10, 5)).rejects.toThrow(ProjectNotFoundError);
  });
});
