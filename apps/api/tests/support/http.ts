import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import { errorHandler } from "../../src/infrastructure/http/middleware/error-handler.middleware.js";
import { makeLocaleMiddleware } from "../../src/infrastructure/http/middleware/locale.middleware.js";

const servers: Server[] = [];

/** Starts a small Express app on a random port with the same base middleware as the real one. */
export async function startApp(configure: (app: Express) => void) {
  const app = express();

  app.use(makeLocaleMiddleware());
  app.use(express.json({ limit: "16kb" }));
  app.use(cookieParser());
  configure(app);
  app.use(errorHandler);

  const server = await new Promise<Server>((resolve) => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  servers.push(server);

  const { port } = server.address() as AddressInfo;

  return { url: `http://127.0.0.1:${port}` };
}

export async function stopApps() {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve());
        }),
    ),
  );
}
