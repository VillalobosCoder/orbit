import { describe, expect, it } from "vitest";
import type { ProjectMemberRepository } from "../../../src/application/project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../../src/application/project/ports/project-repository.port.js";
import { AddProjectMemberUseCase } from "../../../src/application/project/use-cases/add-project-member.use-case.js";
import { GetAvailableUsersUseCase } from "../../../src/application/project/use-cases/get-available-users.use-case.js";
import { GetProjectMembersUseCase } from "../../../src/application/project/use-cases/get-project-members.use-case.js";
import { RemoveProjectMemberUseCase } from "../../../src/application/project/use-cases/remove-project-member.use-case.js";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import {
  CannotRemoveProjectOwnerError,
  NotProjectOwnerError,
  ProjectNotFoundError,
} from "../../../src/domain/project/project.errors.js";
import { UserNotFoundError } from "../../../src/domain/user/user.errors.js";
import { aProject, aUser } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

const person = {
  id: 2,
  name: "Bob",
  lastName: "Marley",
  email: "bob@example.com",
  avatarUrl: null,
};

function projectsOf(ownerUserId = 1, isMember = true) {
  return stub<ProjectRepository>({
    findByIdForMember: async () => (isMember ? aProject({ ownerUserId }) : null),
  });
}

describe("AddProjectMemberUseCase", () => {
  const input = { id: 10, userId: 2, actorUserId: 1 };

  it("lets the owner add an existing user", async () => {
    const members = stub<ProjectMemberRepository>({ add: async () => undefined });
    const users = stub<UserRepository>({ findById: async () => aUser({ id: 2 }) });

    await new AddProjectMemberUseCase(projectsOf(), members, users).execute(input);

    expect(members.add).toHaveBeenCalledWith(input);
  });

  it("rejects a user that does not exist", async () => {
    const members = stub<ProjectMemberRepository>({});
    const users = stub<UserRepository>({ findById: async () => null });

    await expect(
      new AddProjectMemberUseCase(projectsOf(), members, users).execute(input),
    ).rejects.toThrow(UserNotFoundError);
    expect(members.add).not.toHaveBeenCalled();
  });

  it("forbids members who are not the owner", async () => {
    const members = stub<ProjectMemberRepository>({});
    const users = stub<UserRepository>({});

    await expect(
      new AddProjectMemberUseCase(projectsOf(5), members, users).execute(input),
    ).rejects.toThrow(NotProjectOwnerError);
  });

  it("answers not found to outsiders", async () => {
    const members = stub<ProjectMemberRepository>({});
    const users = stub<UserRepository>({});

    await expect(
      new AddProjectMemberUseCase(projectsOf(1, false), members, users).execute(input),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("RemoveProjectMemberUseCase", () => {
  it("lets the owner remove another member", async () => {
    const members = stub<ProjectMemberRepository>({ remove: async () => undefined });

    await new RemoveProjectMemberUseCase(projectsOf(), members).execute({
      id: 10,
      userId: 2,
      actorUserId: 1,
    });

    expect(members.remove).toHaveBeenCalledWith({ id: 10, userId: 2, actorUserId: 1 });
  });

  it("never removes the owner from their own project", async () => {
    const members = stub<ProjectMemberRepository>({});

    await expect(
      new RemoveProjectMemberUseCase(projectsOf(), members).execute({
        id: 10,
        userId: 1,
        actorUserId: 1,
      }),
    ).rejects.toThrow(CannotRemoveProjectOwnerError);
    expect(members.remove).not.toHaveBeenCalled();
  });

  it("forbids members who are not the owner", async () => {
    const members = stub<ProjectMemberRepository>({});

    await expect(
      new RemoveProjectMemberUseCase(projectsOf(5), members).execute({
        id: 10,
        userId: 2,
        actorUserId: 1,
      }),
    ).rejects.toThrow(NotProjectOwnerError);
  });
});

describe("GetProjectMembersUseCase", () => {
  it("lists the members to any member of the project", async () => {
    const members = stub<ProjectMemberRepository>({ findMembers: async () => [person] });

    const result = await new GetProjectMembersUseCase(projectsOf(5), members).execute({
      id: 10,
      actorUserId: 1,
    });

    expect(result).toEqual([person]);
    expect(members.findMembers).toHaveBeenCalledWith({ id: 10 });
  });

  it("hides the list from outsiders", async () => {
    const members = stub<ProjectMemberRepository>({});

    await expect(
      new GetProjectMembersUseCase(projectsOf(1, false), members).execute({
        id: 10,
        actorUserId: 9,
      }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("GetAvailableUsersUseCase", () => {
  it("lets the owner see who can still be added", async () => {
    const members = stub<ProjectMemberRepository>({ findCandidates: async () => [person] });

    const result = await new GetAvailableUsersUseCase(projectsOf(), members).execute({
      id: 10,
      actorUserId: 1,
    });

    expect(result).toEqual([person]);
  });

  it("forbids members who are not the owner", async () => {
    const members = stub<ProjectMemberRepository>({});

    await expect(
      new GetAvailableUsersUseCase(projectsOf(5), members).execute({ id: 10, actorUserId: 1 }),
    ).rejects.toThrow(NotProjectOwnerError);
  });
});
