import * as z from "zod";
import { BootstrapInitialAdminUseCase } from "../src/application/user/use-cases/bootstrap-initial-admin.use-case.js";
import { createDbClient } from "../src/infrastructure/db/client.js";
import { DbContext } from "../src/infrastructure/db/db-context.js";
import { DBUserRepository } from "../src/infrastructure/db/repositories/db-user.repository.js";
import { ScryptPasswordHasher } from "../src/infrastructure/security/scrypt-password-hasher.js";

const bootstrapConfigSchema = z.object({
  name: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(8),
});

const config = bootstrapConfigSchema.parse({
  name: process.env.BOOTSTRAP_ADMIN_NAME,
  lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME,
  email: process.env.BOOTSTRAP_ADMIN_EMAIL,
  password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
});

const { db, pool } = createDbClient();

try {
  const dbContext = new DbContext(db);
  const userRepository = new DBUserRepository(dbContext);
  const useCase = new BootstrapInitialAdminUseCase(
    userRepository,
    new ScryptPasswordHasher(),
    dbContext,
  );

  await useCase.execute(config);
  console.log(`Administrador inicial creado para ${config.email}.`);
} finally {
  await pool.end();
}
