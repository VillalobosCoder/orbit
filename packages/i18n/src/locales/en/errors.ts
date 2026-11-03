import type { Messages } from "../../translate.js";

export const errors: Messages["errors"] = {
  http: {
    notAuthenticated: "Not authenticated.",
    sessionInvalid: "Your session is no longer valid.",
    sessionExpired: "Invalid or expired session.",
    mustChangePassword: "You must change your password before continuing.",
    forbidden: "You don't have permission to do this.",
    tooManyAttempts: "Too many attempts. Please try again later.",
    invalidData: "Invalid data",
    invalidJson: "The JSON body is not valid.",
    bodyTooLarge: "The request body is too large.",
    unsupportedFormat: "Unsupported request format.",
    internal: "Internal server error.",
    technicalProblems:
      "We are experiencing technical problems. Please try again later.",
    cannotEditOwnPermissions: "You can't change your own permissions.",
    cannotDeleteOwnAccount: "You can't delete your own account.",
  },
  validation: {
    duplicateModule: "A module cannot be repeated.",
    needPermission: "Select at least one permission for each module.",
  },
  comment: {
    notFound: "Comment {commentId} was not found.",
    onlyAuthor: "Only the author can edit or delete their comment.",
  },
  notification: {
    notFound: "Notification {notificationId} was not found.",
  },
  attachment: {
    notFound: "Attachment {attachmentId} was not found.",
    invalid: "The file must be a valid image (PNG, JPG, WebP, GIF) or video (MP4, WebM).",
    tooLarge: "The file cannot exceed {maxMegabytes} MB.",
    tooMany: "An issue can have at most {max} attachments.",
  },
  boardColumn: {
    notFound: "Column {columnId} was not found.",
    nameExists: 'A column named "{name}" already exists in this project.',
    reorderMismatch:
      "The order must include every column of the project exactly once.",
    chooseTarget: "Choose another column of the project to receive the issues.",
    needTodoAndDone:
      "The project needs at least one 'To do' column and one 'Done' column.",
  },
  user: {
    invalidEmail: 'The email "{raw}" is not in a valid format.',
    weakPassword: "The password must be at least 8 characters long.",
    passwordTooLong: "The password cannot exceed 1024 bytes.",
    alreadyExists: "A user with the email {email} already exists.",
    notFound: "User {id} was not found.",
    invalidModule: 'The module "{module}" does not exist.',
    initialAdminExists:
      "The initial administrator can only be set up when no users exist.",
    invalidCredentials: "Incorrect email or password.",
    passwordPolicy:
      "The password must be at least 8 characters long, with one uppercase letter and one number.",
    incorrectCurrentPassword: "The current password is incorrect.",
    samePassword: "The new password must be different from the current one.",
    cannotResetOwnPassword:
      "You can't reset your own password; change it from your profile.",
    invalidAvatar: "The photo must be a valid PNG, JPG or WebP image.",
    avatarTooLarge: "The photo cannot exceed 2 MB.",
    avatarNotFound: "The user has no profile photo.",
    permissionRequiresParent:
      "To grant access to «{module}», access to «{parent}» is also required.",
  },
  issue: {
    notFound: "Issue {issueId} was not found.",
    invalidDates: "The start date cannot be after the end date.",
    reference: {
      priority: "The priority does not belong to this project.",
      difficulty: "The difficulty does not belong to this project.",
      type: "The issue type does not belong to this project.",
      parent: "The parent issue does not belong to this project.",
      column: "The column does not belong to this project.",
      sprint: "The sprint does not belong to this project.",
      neighbor: "The neighboring card does not belong to this project.",
    },
    parent: {
      onlySubtasks: "Only subtasks can have a parent issue.",
      subtaskNeedsParent: "A subtask needs a parent issue.",
      ownParent: "An issue cannot be its own parent.",
      subtaskAsParent: "A subtask cannot be the parent of another subtask.",
      withChildren: "An issue with subtasks cannot become a subtask.",
      followsParentSprint: "Subtasks follow the sprint of their parent issue.",
    },
    assigneeNotMember: "User {userId} is not a member of the project.",
    actionNotAllowed: {
      move: "You don't have permission to move issues between columns.",
      changeSprint: "You don't have permission to change an issue's sprint.",
    },
  },
  project: {
    invalidKey:
      'The key "{raw}" is not valid: use 2 to 10 characters, uppercase letters or numbers, starting with a letter.',
    notFound: "Project {id} was not found.",
    keyExists: "You already have a project with the key {projectKey}.",
    onlyOwner: "Only the project owner can perform this action.",
    alreadyMember: "The user is already a member of the project.",
    notMember: "User {userId} is not a member of the project.",
    cannotRemoveOwner: "You can't remove the project owner.",
  },
  sprint: {
    notFound: "Sprint {sprintId} was not found.",
    endBeforeStart: "The end date cannot be before the start date.",
    nameExists: 'A sprint named "{name}" already exists in this project.',
    alreadyActive:
      "The project already has an active sprint. Complete it before starting another.",
    state: {
      closedNotEditable: "A closed sprint cannot be edited.",
      onlyPlannedStart: "Only a planned sprint can be started.",
      onlyActiveClose: "Only an active sprint can be completed.",
      onlyPlannedDelete: "Only a sprint that hasn't started can be deleted.",
      closedNoIssues: "Issues cannot be assigned to a closed sprint.",
    },
  },
};
