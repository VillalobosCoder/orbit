import type { PasswordHasher } from "../../../application/user/ports/password-hasher.port.js";
import type { UserRepository } from "../../../application/user/ports/user-repository.port.js";
import type { TokenService } from "../../../application/auth/ports/token-service.port.js";
import type { UserPermissionRepository } from "../../../application/auth/ports/user-permission-repository.port.js";
import type { TransactionManager } from "../../../application/shared/ports/transaction-manager.port.js";
import type { ModuleRepository } from "../../../application/modules/ports/module-repository.port.js";
import { LoginUseCase } from "../../../application/auth/use-cases/login.use-case.js";
import { GetCurrentUserUseCase } from "../../../application/auth/use-cases/get-current-user.use-case.js";
import { ChangePasswordUseCase } from "../../../application/auth/use-cases/change-password.use-case.js";
import { UpdateProfileUseCase } from "../../../application/auth/use-cases/update-profile.use-case.js";
import { ResetUserPasswordUseCase } from "../../../application/user/use-cases/reset-user-password.use-case.js";
import { CreateUserUseCase } from "../../../application/user/use-cases/create-user.use-case.js";
import { DeleteUserUseCase } from "../../../application/user/use-cases/delete-user.use-case.js";
import { AuthController } from "./auth.controller.js";
import { UserController } from "./user.controller.js";
import { GetUserListUseCase } from "../../../application/user/use-cases/get-user-list.use-case.js";
import { GetUserUseCase } from "../../../application/user/use-cases/get-user.use-case.js";
import { UpdateUserUseCase } from "../../../application/user/use-cases/update-user.use-case.js";
import { ModuleController } from "./module.controller.js";
import type { ProjectMemberRepository } from "../../../application/project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../../application/project/ports/project-repository.port.js";
import { AddProjectMemberUseCase } from "../../../application/project/use-cases/add-project-member.use-case.js";
import { CreateProjectUseCase } from "../../../application/project/use-cases/create-project.use-case.js";
import { DeleteProjectUseCase } from "../../../application/project/use-cases/delete-project.use-case.js";
import { GetAvailableUsersUseCase } from "../../../application/project/use-cases/get-available-users.use-case.js";
import { GetProjectListUseCase } from "../../../application/project/use-cases/get-project-list.use-case.js";
import { GetProjectMembersUseCase } from "../../../application/project/use-cases/get-project-members.use-case.js";
import { GetProjectUseCase } from "../../../application/project/use-cases/get-project.use-case.js";
import { RemoveProjectMemberUseCase } from "../../../application/project/use-cases/remove-project-member.use-case.js";
import { UpdateProjectUseCase } from "../../../application/project/use-cases/update-project.use-case.js";
import { ProjectController } from "./project.controller.js";
import type { IssueCatalogRepository } from "../../../application/issue/ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../../../application/issue/ports/issue-repository.port.js";
import { CreateIssueUseCase } from "../../../application/issue/use-cases/create-issue.use-case.js";
import { DeleteIssueUseCase } from "../../../application/issue/use-cases/delete-issue.use-case.js";
import { GetBoardUseCase } from "../../../application/issue/use-cases/get-board.use-case.js";
import { GetIssueOptionsUseCase } from "../../../application/issue/use-cases/get-issue-options.use-case.js";
import { GetIssueUseCase } from "../../../application/issue/use-cases/get-issue.use-case.js";
import { MoveIssueUseCase } from "../../../application/issue/use-cases/move-issue.use-case.js";
import { UpdateIssueUseCase } from "../../../application/issue/use-cases/update-issue.use-case.js";
import { IssueController } from "./issue.controller.js";
import type { CommentRepository } from "../../../application/comment/ports/comment-repository.port.js";
import { CreateCommentUseCase } from "../../../application/comment/use-cases/create-comment.use-case.js";
import { DeleteCommentUseCase } from "../../../application/comment/use-cases/delete-comment.use-case.js";
import { GetCommentsUseCase } from "../../../application/comment/use-cases/get-comments.use-case.js";
import { UpdateCommentUseCase } from "../../../application/comment/use-cases/update-comment.use-case.js";
import { CommentController } from "./comment.controller.js";
import type { SprintRepository } from "../../../application/sprint/ports/sprint-repository.port.js";
import { AssignIssueSprintUseCase } from "../../../application/sprint/use-cases/assign-issue-sprint.use-case.js";
import { CloseSprintUseCase } from "../../../application/sprint/use-cases/close-sprint.use-case.js";
import { CreateSprintUseCase } from "../../../application/sprint/use-cases/create-sprint.use-case.js";
import { DeleteSprintUseCase } from "../../../application/sprint/use-cases/delete-sprint.use-case.js";
import { GetPlanningUseCase } from "../../../application/sprint/use-cases/get-planning.use-case.js";
import { StartSprintUseCase } from "../../../application/sprint/use-cases/start-sprint.use-case.js";
import { UpdateSprintUseCase } from "../../../application/sprint/use-cases/update-sprint.use-case.js";
import { SprintController } from "./sprint.controller.js";
import type { BoardColumnRepository } from "../../../application/board-column/ports/board-column-repository.port.js";
import { CreateBoardColumnUseCase } from "../../../application/board-column/use-cases/create-board-column.use-case.js";
import { DeleteBoardColumnUseCase } from "../../../application/board-column/use-cases/delete-board-column.use-case.js";
import { ReorderBoardColumnsUseCase } from "../../../application/board-column/use-cases/reorder-board-columns.use-case.js";
import { UpdateBoardColumnUseCase } from "../../../application/board-column/use-cases/update-board-column.use-case.js";
import { BoardColumnController } from "./board-column.controller.js";

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
  sprintRepository: SprintRepository;
  boardColumnRepository: BoardColumnRepository;
}

export function createControllers(dependencies: ControllerDependencies) {
  const createUser = new CreateUserUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.userPermissionRepository,
    dependencies.transaction,
  );
  const deleteUser = new DeleteUserUseCase(dependencies.userRepository);
  const getCurrentUser = new GetCurrentUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
  );
  const getUser = new GetUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
  );
  const updateUser = new UpdateUserUseCase(
    dependencies.userRepository,
    dependencies.userPermissionRepository,
    dependencies.transaction,
  );
  const resetUserPassword = new ResetUserPasswordUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
  );
  const changePassword = new ChangePasswordUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.tokenService,
  );
  const getAllUsers = new GetUserListUseCase(dependencies.userRepository);
  const login = new LoginUseCase(
    dependencies.userRepository,
    dependencies.passwordHasher,
    dependencies.tokenService,
    dependencies.userPermissionRepository,
  );

  return {
    users: new UserController(
      getAllUsers,
      createUser,
      deleteUser,
      getUser,
      updateUser,
      resetUserPassword,
    ),
    auth: new AuthController(
      login,
      getCurrentUser,
      changePassword,
      new UpdateProfileUseCase(dependencies.userRepository),
    ),
    modules: new ModuleController(dependencies.moduleRepository),
    projects: new ProjectController(
      new GetProjectListUseCase(dependencies.projectRepository),
      new GetProjectUseCase(dependencies.projectRepository),
      new CreateProjectUseCase(
        dependencies.projectRepository,
        dependencies.projectMemberRepository,
        dependencies.issueCatalogRepository,
        dependencies.transaction,
      ),
      new UpdateProjectUseCase(dependencies.projectRepository),
      new DeleteProjectUseCase(dependencies.projectRepository),
      new GetProjectMembersUseCase(
        dependencies.projectRepository,
        dependencies.projectMemberRepository,
      ),
      new GetAvailableUsersUseCase(
        dependencies.projectRepository,
        dependencies.projectMemberRepository,
      ),
      new AddProjectMemberUseCase(
        dependencies.projectRepository,
        dependencies.projectMemberRepository,
        dependencies.userRepository,
      ),
      new RemoveProjectMemberUseCase(
        dependencies.projectRepository,
        dependencies.projectMemberRepository,
      ),
    ),
    issues: new IssueController(
      new GetBoardUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
        dependencies.issueRepository,
        dependencies.issueCatalogRepository,
      ),
      new GetIssueOptionsUseCase(
        dependencies.projectRepository,
        dependencies.issueCatalogRepository,
      ),
      new CreateIssueUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
        dependencies.projectMemberRepository,
        dependencies.issueRepository,
        dependencies.issueCatalogRepository,
        dependencies.transaction,
      ),
      new GetIssueUseCase(
        dependencies.projectRepository,
        dependencies.issueRepository,
      ),
      new UpdateIssueUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
        dependencies.projectMemberRepository,
        dependencies.issueRepository,
        dependencies.issueCatalogRepository,
        dependencies.transaction,
      ),
      new MoveIssueUseCase(
        dependencies.projectRepository,
        dependencies.issueRepository,
        dependencies.issueCatalogRepository,
      ),
      new DeleteIssueUseCase(
        dependencies.projectRepository,
        dependencies.issueRepository,
        dependencies.transaction,
      ),
    ),
    comments: new CommentController(
      new GetCommentsUseCase(
        dependencies.projectRepository,
        dependencies.issueRepository,
        dependencies.commentRepository,
      ),
      new CreateCommentUseCase(
        dependencies.projectRepository,
        dependencies.issueRepository,
        dependencies.commentRepository,
      ),
      new UpdateCommentUseCase(
        dependencies.projectRepository,
        dependencies.commentRepository,
      ),
      new DeleteCommentUseCase(
        dependencies.projectRepository,
        dependencies.commentRepository,
      ),
    ),
    sprints: new SprintController(
      new GetPlanningUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
        dependencies.issueRepository,
        dependencies.issueCatalogRepository,
      ),
      new CreateSprintUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
      ),
      new UpdateSprintUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
      ),
      new DeleteSprintUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
        dependencies.issueRepository,
        dependencies.transaction,
      ),
      new StartSprintUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
      ),
      new CloseSprintUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
        dependencies.issueRepository,
        dependencies.transaction,
      ),
      new AssignIssueSprintUseCase(
        dependencies.projectRepository,
        dependencies.sprintRepository,
        dependencies.issueRepository,
        dependencies.transaction,
      ),
    ),
    boardColumns: new BoardColumnController(
      new CreateBoardColumnUseCase(
        dependencies.projectRepository,
        dependencies.boardColumnRepository,
      ),
      new UpdateBoardColumnUseCase(
        dependencies.projectRepository,
        dependencies.boardColumnRepository,
      ),
      new ReorderBoardColumnsUseCase(
        dependencies.projectRepository,
        dependencies.boardColumnRepository,
        dependencies.transaction,
      ),
      new DeleteBoardColumnUseCase(
        dependencies.projectRepository,
        dependencies.boardColumnRepository,
        dependencies.transaction,
      ),
    ),
  };
}
