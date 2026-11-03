import type { Messages } from "../../translate.js";

export const toasts: Messages["toasts"] = {
  errorTitle: "The action could not be completed",
  successTitle: "Done",
  userUpdated: "User updated.",
  userDeleted: "User deleted.",
  projectCreated: "Project created.",
  projectUpdated: "Project updated.",
  projectDeleted: "Project deleted.",
  memberAdded: "Member added to the project.",
  memberRemoved: "Member removed from the project.",
  sprintCreated: "Sprint created.",
  sprintUpdated: "Sprint updated.",
  sprintDeleted: "Sprint deleted.",
  sprintStarted: "Sprint started.",
  sprintClosed: "Sprint completed.",
  issueCreated: "Issue created.",
  issueUpdated: "Issue updated.",
  issueDeleted: "Issue deleted.",
  commentDeleted: "Comment deleted.",
  attachmentAdded: "File attached.",
  attachmentDeleted: "Attachment removed.",
  columnsUpdated: "Columns updated.",
};

export const notifications: Messages["notifications"] = {
  title: "Notifications",
  hint: "Confirmation notices appear in a corner when an action completes. Errors are always shown.",
  group: "Confirmation notices",
  on: "Show notices",
  onDescription: "You'll see a confirmation when you save, create or delete.",
  off: "Hide notices",
  offDescription: "You'll only see error notices.",
};
