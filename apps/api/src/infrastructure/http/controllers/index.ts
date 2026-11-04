import { createUserController } from "./factories/user.factory.js";
import { createAuthController } from "./factories/auth.factory.js";
import { createModuleController } from "./factories/module.factory.js";
import { createHomeController } from "./factories/home.factory.js";
import { createProjectController } from "./factories/project.factory.js";
import { createIssueController } from "./factories/issue.factory.js";
import { createCommentController } from "./factories/comment.factory.js";
import { createAttachmentController } from "./factories/attachment.factory.js";
import { createNotificationController } from "./factories/notification.factory.js";
import { createSprintController } from "./factories/sprint.factory.js";
import { createBoardColumnController } from "./factories/board-column.factory.js";
import type { ControllerDependencies } from "./dependencies.js";

export type { ControllerDependencies };

export function createControllers(dependencies: ControllerDependencies) {
  return {
    users: createUserController(dependencies),
    auth: createAuthController(dependencies),
    modules: createModuleController(dependencies),
    home: createHomeController(dependencies),
    projects: createProjectController(dependencies),
    issues: createIssueController(dependencies),
    comments: createCommentController(dependencies),
    attachments: createAttachmentController(dependencies),
    notifications: createNotificationController(dependencies),
    sprints: createSprintController(dependencies),
    boardColumns: createBoardColumnController(dependencies),
  };
}
