import { createControllers } from "./src/infrastructure/http/controllers/index.js";
import { createHttpApp } from "./src/infrastructure/http/app.js";
import { createDbClient } from "./src/infrastructure/db/client.js";
import { DBUserRepository } from "./src/infrastructure/db/repositories/db-user.repository.js";
import { ScryptPasswordHasher } from "./src/infrastructure/security/scrypt-password-hasher.js";
import { JwtTokenService } from "./src/infrastructure/security/jwt-token-service.js";

const hostname = process.env.HOSTNAME ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 3000);

const { db, pool } = createDbClient();
const userRepository = new DBUserRepository(db);
const passwordHasher = new ScryptPasswordHasher();
const tokenService = new JwtTokenService();
const controllers = createControllers({
  userRepository,
  passwordHasher,
  tokenService,
});
const app = createHttpApp(controllers, tokenService);

await pool.query("SELECT 1");

const server = app.listen(port, hostname, () => {
  console.log(`API escuchando en http://${hostname}:${port}`);
});

server.on("close", () => {
  void pool.end();
});
