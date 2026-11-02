import type { Messages } from "../../translate.js";

export const common: Messages["common"] = {
  save: "Save",
  saveChanges: "Save changes",
  saving: "Saving...",
  cancel: "Cancel",
  delete: "Delete",
  deleting: "Deleting...",
  edit: "Edit",
  close: "Close",
  loading: "Loading",
  noRecords: "No records",
  add: "Add",
  remove: "Remove",
  goBack: "Go back",
  goHome: "Back to home",
  reload: "Reload",
  email: "Email",
  name: "First name",
  lastName: "Last name",
  password: "Password",
  optional: "optional",
  unassigned: "Unassigned",
  backlog: "Backlog",
  actions: "Actions",
  confirm: "Confirm",
  processing: "Processing...",
  none: "—",
};

export const api: Messages["api"] = {
  network:
    "We couldn't reach the server. Check your connection and try again.",
  timeout:
    "The server took too long to respond. Please try again in a few minutes.",
  serviceUnavailable:
    "The service is unavailable right now. Please try again later.",
  unexpected: "An unexpected error occurred. Please try again.",
  emptySession: "The API did not return the session data.",
  emptyHome: "The API did not return the summary.",
  emptyModules: "The API did not return the modules.",
  emptyUsers: "The API did not return the users.",
  emptyUser: "The API did not return the user.",
  emptyProjects: "The API did not return the projects.",
  emptyProject: "The API did not return the project.",
  emptyMembers: "The API did not return the members.",
  emptyAvailableUsers: "The API did not return the available users.",
  emptyBoard: "The API did not return the board.",
  emptyIssueOptions: "The API did not return the issue options.",
  emptyComments: "The API did not return the comments.",
  emptyPlanning: "The API did not return the planning.",
  emptyCreatedColumn: "The API did not return the created column.",
};
