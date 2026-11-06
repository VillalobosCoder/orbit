import { describe, expect, it } from "vitest";
import type { UserRepository } from "../../../src/application/user/ports/user-repository.port.js";
import { GetUserListUseCase } from "../../../src/application/user/use-cases/get-user-list.use-case.js";
import { aUser } from "../../support/builders.js";
import { stub } from "../../support/stub.js";

const query = {
  search: "ad",
  sortBy: "name",
  sortDirection: "asc",
  page: 2,
  pageSize: 10,
} as const;

describe("GetUserListUseCase", () => {
  it("maps the page of users to dtos without secrets", async () => {
    const users = stub<UserRepository>({
      findPage: async () => ({
        users: [aUser(), aUser({ id: 2, email: "bob@example.com", avatarFileId: 4 })],
        total: 12,
        page: 2,
      }),
    });

    const result = await new GetUserListUseCase(users).execute(query);

    expect(users.findPage).toHaveBeenCalledWith(query);
    expect(result.total).toBe(12);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.items.map((item) => item.email)).toEqual([
      "ada@example.com",
      "bob@example.com",
    ]);
    expect(result.items[1]?.avatarUrl).toContain("/users/2/avatar");
    expect(JSON.stringify(result)).not.toContain("hash:");
  });

  it("reports the page the repository actually served", async () => {
    const users = stub<UserRepository>({
      findPage: async () => ({ users: [], total: 0, page: 1 }),
    });

    const result = await new GetUserListUseCase(users).execute({ ...query, page: 5 });

    expect(result.page).toBe(1);
    expect(result.items).toEqual([]);
  });
});
