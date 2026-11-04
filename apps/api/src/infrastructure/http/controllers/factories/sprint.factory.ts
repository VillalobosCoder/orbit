import { AssignIssueSprintUseCase } from "../../../../application/sprint/use-cases/assign-issue-sprint.use-case.js";
import { CloseSprintUseCase } from "../../../../application/sprint/use-cases/close-sprint.use-case.js";
import { CreateSprintUseCase } from "../../../../application/sprint/use-cases/create-sprint.use-case.js";
import { DeleteSprintUseCase } from "../../../../application/sprint/use-cases/delete-sprint.use-case.js";
import { GetPlanningUseCase } from "../../../../application/sprint/use-cases/get-planning.use-case.js";
import { SprintController } from "../sprint.controller.js";
import { StartSprintUseCase } from "../../../../application/sprint/use-cases/start-sprint.use-case.js";
import { UpdateSprintUseCase } from "../../../../application/sprint/use-cases/update-sprint.use-case.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createSprintController(dependencies: ControllerDependencies) {
  return new SprintController(
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
  );
}
