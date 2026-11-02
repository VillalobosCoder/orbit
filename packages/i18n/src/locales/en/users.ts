import type { Messages } from "../../translate.js";

export const users: Messages["users"] = {
  title: "Users",
  description: "Manage your team's accounts and access permissions.",
  newUser: "New user",
  selfTag: "(you)",
  search: {
    placeholder: "Search by name or email",
    label: "Search users",
    noMatches: "No user matches the search.",
  },
  columns: {
    user: "User",
  },
  actions: {
    edit: "Edit {name}",
    editTitle: "Edit and permissions",
    reset: "Reset the password of {name}",
    resetTitle: "Reset password",
    delete: "Delete {name}",
    deleteTitle: "Delete",
  },
  deleteDialog: {
    title: "Delete user?",
    before: "The account of",
    after: " will be deleted. This action cannot be undone.",
    confirm: "Delete user",
  },
  resetDialog: {
    title: "Reset the password?",
    before: "A temporary password will be generated for",
    after:
      ". The current one will stop working and the person will have to change it when signing in again.",
    confirm: "Reset password",
    pending: "Resetting...",
  },
  resetDone: {
    title: "Password reset",
    description:
      "Share this temporary password with {name}. It won't be shown again after you close this dialog.",
  },
  temporary: {
    label: "Temporary password · shown only once",
    copy: "Copy",
    copied: "Copied",
    hint: "The person will have to change it the next time they sign in.",
    done: "Done",
  },
  form: {
    createdTitle: "User created",
    createdDescription:
      "Share this temporary password with the user. It won't be shown again after you close this dialog.",
    editTitle: "Edit user",
    newTitle: "New user",
    editDescription: "Edit the details and permissions of {name}.",
    newDescription:
      "Enter the person's details. The system will generate a temporary password that you'll see only once.",
    ownPermissions: "You can't change your own permissions.",
    permissionsLegend: "Permissions by module",
    writeIncludesRead: "Write includes read",
    loadingModules: "Loading modules...",
    modulesError: "The modules could not be loaded. Try again before saving.",
    moduleColumn: "Module",
    read: "Read",
    write: "Write",
    readOf: "{label}: read",
    writeOf: "{label}: write",
    subsectionsHint:
      "Project subsections are only enabled if the person can read Projects. Editing projects and commenting require Write on Projects.",
    create: "Create user",
    creating: "Creating user...",
  },
};

export const modules: Messages["modules"] = {
  home: "Home",
  users: "Users",
  projects: "Projects",
  projectsIssues: "Issues",
  projectsMoveIssues: "Move issues",
  projectsSprints: "Sprints",
  projectsColumns: "Columns",
};
