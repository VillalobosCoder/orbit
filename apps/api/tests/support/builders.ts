import { Project } from "../../src/domain/project/project.entity.js";
import { User } from "../../src/domain/user/user.entity.js";

export function aUser(overrides: Partial<Parameters<typeof User.fromPersistence>[0]> = {}) {
  return User.fromPersistence({
    id: 1,
    name: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    password: "hash:Secret123",
    mustChangePassword: false,
    avatarFileId: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  });
}

export function aProject(
  overrides: Partial<Parameters<typeof Project.fromPersistence>[0]> = {},
) {
  return Project.fromPersistence({
    id: 10,
    ownerUserId: 1,
    projectKey: "WEB",
    name: "Website",
    description: "The company site",
    ...overrides,
  });
}
