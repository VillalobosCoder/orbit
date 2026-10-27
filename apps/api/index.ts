import { createControllers } from "./src/infrastructure/http/controllers/index.js";
import { createHttpApp } from "./src/infrastructure/http/app.js";
import { createDbClient } from "./src/infrastructure/db/client.js";
import { DbContext } from "./src/infrastructure/db/db-context.js";
import { DBUserRepository } from "./src/infrastructure/db/repositories/db-user.repository.js";
import { ScryptPasswordHasher } from "./src/infrastructure/security/scrypt-password-hasher.js";
import { JwtTokenService } from "./src/infrastructure/security/jwt-token-service.js";
import { DBUserPermissionRepository } from "./src/infrastructure/db/repositories/db-user-permission.repository.js";
import { DBCommentRepository } from "./src/infrastructure/db/repositories/db-comment.repository.js";
import { DBIssueCatalogRepository } from "./src/infrastructure/db/repositories/db-issue-catalog.repository.js";
import { DBIssueRepository } from "./src/infrastructure/db/repositories/db-issue.repository.js";
import { DBProjectMemberRepository } from "./src/infrastructure/db/repositories/db-project-member.repository.js";
import { DBProjectRepository } from "./src/infrastructure/db/repositories/db-project.repository.js";
import { DBModuleRepository } from "./src/infrastructure/db/repositories/db-module.repository.js";

const hostname = process.env.HOSTNAME!;
const port = Number(process.env.PORT!);

const { db, pool } = createDbClient();
const dbContext = new DbContext(db);
const userRepository = new DBUserRepository(dbContext);
const userPermissionRepository = new DBUserPermissionRepository(dbContext);
const moduleRepository = new DBModuleRepository(dbContext);
const projectRepository = new DBProjectRepository(dbContext);
const projectMemberRepository = new DBProjectMemberRepository(dbContext);
const issueRepository = new DBIssueRepository(dbContext);
const issueCatalogRepository = new DBIssueCatalogRepository(dbContext);
const commentRepository = new DBCommentRepository(dbContext);
const passwordHasher = new ScryptPasswordHasher();
const tokenService = new JwtTokenService();
const controllers = createControllers({
  userRepository,
  passwordHasher,
  tokenService,
  userPermissionRepository,
  moduleRepository,
  transaction: dbContext,
  projectRepository,
  projectMemberRepository,
  issueRepository,
  issueCatalogRepository,
  commentRepository,
});
const app = createHttpApp(controllers, tokenService, userPermissionRepository);

await pool.query("SELECT 1");

const server = app.listen(port, hostname, () => {
  console.log(`API escuchando en http://${hostname}:${port}`);
});

server.on("close", () => {
  void pool.end();
});
