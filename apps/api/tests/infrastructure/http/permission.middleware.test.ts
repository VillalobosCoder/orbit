import { afterEach, describe, expect, it } from "vitest";
import type { UserPermissionRepository } from "../../../src/application/auth/ports/user-permission-repository.port.js";
import { makePermissionMiddleware } from "../../../src/infrastructure/http/middleware/permission.middleware.js";
import { startApp, stopApps } from "../../support/http.js";
import { stub } from "../../support/stub.js";

afterEach(stopApps);

async function call(permissions: UserPermissionRepository, userId: number | undefined) {
  const { url } = await startApp((app) => {
    app.get(
      "/x",
      (req, _res, next) => {
        if (userId !== undefined) {
          (req as unknown as { auth: object }).auth = { id: userId, mustChangePassword: false };
        }
        next();
      },
      makePermissionMiddleware(permissions, "projects", "write"),
      (_req, res) => {
        res.json({ ok: true });
      },
    );
  });

  return fetch(`${url}/x`);
}

describe("permission middleware", () => {
  it("lets users with the permission through, asking for the right module and action", async () => {
    const permissions = stub<UserPermissionRepository>({ hasPermission: async () => true });

    const response = await call(permissions, 4);

    expect(response.status).toBe(200);
    expect(permissions.hasPermission).toHaveBeenCalledWith(4, "projects", "write");
  });

  it("answers 403 to users without it", async () => {
    const response = await call(stub<UserPermissionRepository>({ hasPermission: async () => false }), 4);

    expect(response.status).toBe(403);
  });

  it("answers 401 when there is no authenticated user", async () => {
    const permissions = stub<UserPermissionRepository>({});

    const response = await call(permissions, undefined);

    expect(response.status).toBe(401);
    expect(permissions.hasPermission).not.toHaveBeenCalled();
  });

  it("answers 500 instead of granting access when the check itself fails", async () => {
    const permissions = stub<UserPermissionRepository>({
      hasPermission: async () => {
        throw new Error("database down");
      },
    });

    const response = await call(permissions, 4);

    expect(response.status).toBe(500);
  });
});
