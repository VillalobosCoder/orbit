import type { UserRepository } from "../../../application/user/ports/user-repository.port.js";
import type { PasswordHasher } from "../../../application/user/ports/password-hasher.port.js";
import type { TokenService } from "../../../application/auth/ports/token-service.port.js";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { ModuleRepository } from "../../../application/modules/ports/module-repository.port.js";
import type { TransactionManager } from "../../../application/shared/ports/transaction-manager.port.js";
import type { ProjectRepository } from "../../../application/project/ports/project-repository.port.js";
import type { ProjectMemberRepository } from "../../../application/project/ports/project-member-repository.port.js";
import type { IssueRepository } from "../../../application/issue/ports/issue-repository.port.js";
import type { IssueCatalogRepository } from "../../../application/issue/ports/issue-catalog-repository.port.js";
import type { CommentRepository } from "../../../application/comment/ports/comment-repository.port.js";
import type { AttachmentRepository } from "../../../application/attachment/ports/attachment-repository.port.js";
import type { NotificationRepository } from "../../../application/notification/ports/notification-repository.port.js";
import type { SprintRepository } from "../../../application/sprint/ports/sprint-repository.port.js";
import type { BoardColumnRepository } from "../../../application/board-column/ports/board-column-repository.port.js";
import type { FileRepository } from "../../../application/file/ports/file-repository.port.js";
import type { FileStorage } from "../../../application/file/ports/file-storage.port.js";
import type { HomeRepository } from "../../../application/home/ports/home-repository.port.js";

export interface ControllerDependencies {
  userRepository: UserRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
  userPermissionRepository: UserPermissionRepository;
  moduleRepository: ModuleRepository;
  transaction: TransactionManager;
  projectRepository: ProjectRepository;
  projectMemberRepository: ProjectMemberRepository;
  issueRepository: IssueRepository;
  issueCatalogRepository: IssueCatalogRepository;
  commentRepository: CommentRepository;
  attachmentRepository: AttachmentRepository;
  notificationRepository: NotificationRepository;
  sprintRepository: SprintRepository;
  boardColumnRepository: BoardColumnRepository;
  fileRepository: FileRepository;
  fileStorage: FileStorage;
  homeRepository: HomeRepository;
}
