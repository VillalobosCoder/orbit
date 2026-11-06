import { describe, expect, it } from "vitest";
import {
  InvalidProjectKeyError,
  NotProjectOwnerError,
} from "../../../src/domain/project/project.errors.js";
import { Project } from "../../../src/domain/project/project.entity.js";
import { aProject } from "../../support/builders.js";

describe("Project", () => {
  it("normalizes the name, description and key on register", () => {
    const project = Project.register({
      ownerUserId: 1,
      projectKey: " web ",
      name: "  Website ",
      description: "  ",
    });

    expect(project.projectKey).toBe("WEB");
    expect(project.name).toBe("Website");
    expect(project.description).toBeNull();
  });

  it.each(["", "W", "1WEB", "WEB-1", "TOOLONGKEY1", "we b"])(
    "rejects the invalid key %j",
    (key) => {
      expect(() =>
        Project.register({ ownerUserId: 1, projectKey: key, name: "Site" }),
      ).toThrow(InvalidProjectKeyError);
    },
  );

  it("accepts keys of 2 to 10 letters and digits", () => {
    expect(() => Project.register({ ownerUserId: 1, projectKey: "A1", name: "x" })).not.toThrow();
    expect(() =>
      Project.register({ ownerUserId: 1, projectKey: "ABCDEFGHI1", name: "x" }),
    ).not.toThrow();
  });

  it("updates name and description but never the key or the owner", () => {
    const updated = aProject().withDetails({ name: " New ", description: "Text" });

    expect(updated.name).toBe("New");
    expect(updated.description).toBe("Text");
    expect(updated.projectKey).toBe("WEB");
    expect(updated.ownerUserId).toBe(1);
  });

  it("only lets the owner pass the ownership check", () => {
    const project = aProject({ ownerUserId: 1 });

    expect(() => project.assertOwnedBy(1)).not.toThrow();
    expect(() => project.assertOwnedBy(2)).toThrow(NotProjectOwnerError);
  });

  it("refuses to read the id before the project is saved", () => {
    const project = Project.register({ ownerUserId: 1, projectKey: "WEB", name: "x" });

    expect(project.id).toBeUndefined();
    expect(() => project.persistedId).toThrow();
  });
});
