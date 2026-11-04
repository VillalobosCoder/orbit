import { CreateIssueUseCase } from "../../../../application/issue/use-cases/create-issue.use-case.js";
import { DeleteIssueUseCase } from "../../../../application/issue/use-cases/delete-issue.use-case.js";
import { GetBoardUseCase } from "../../../../application/issue/use-cases/get-board.use-case.js";
import { GetIssueOptionsUseCase } from "../../../../application/issue/use-cases/get-issue-options.use-case.js";
import { GetIssueUseCase } from "../../../../application/issue/use-cases/get-issue.use-case.js";
import { IssueController } from "../issue.controller.js";
import { MoveIssueUseCase } from "../../../../application/issue/use-cases/move-issue.use-case.js";
import { UpdateIssueUseCase } from "../../../../application/issue/use-cases/update-issue.use-case.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createIssueController(dependencies: ControllerDependencies) {
  return new IssueController(
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
      dependencies.notificationRepository,
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
      dependencies.notificationRepository,
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
    dependencies.userPermissionRepository,
  );
}
