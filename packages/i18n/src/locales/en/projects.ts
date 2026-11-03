import type { Messages } from "../../translate.js";

export const projects: Messages["projects"] = {
  detail: {
    notFound: "Project not found.",
    retry: "Retry",
    retrying: "Retrying...",
    members: "Members",
    editProject: "Edit project",
    deleteProject: "Delete",
  },
  deleteDialog: {
    title: "Delete project?",
    before: "",
    after:
      "will be deleted and will no longer be available to any of its members. It can't be recovered from the application.",
    confirm: "Delete project",
  },
  form: {
    editTitle: "Edit project",
    newTitle: "New project",
    editDescription:
      "Change the name or the description. The key is permanent.",
    newDescription:
      "You'll be the owner and the first member. It starts with the default columns and issue types.",
    key: "Key",
    keyReadOnly: "Read only",
    keyImmutable: "Immutable",
    keyHint: "2–10 letters or numbers",
    keyPlaceholder: "KEY",
    keyPreview:
      "This is how your issue keys will look. It can't be changed later.",
    description: "Description",
    create: "Create project",
  },
  members: {
    section: "Project members",
    title: "Members",
    intro: "Only members can see this project.",
    ownerManages: "As the owner, you decide who comes in and who leaves.",
    othersManage: "The owner manages who comes in and who leaves.",
    memberColumn: "Member",
    roleColumn: "Role",
    owner: "Owner",
    member: "Member",
    remove: "Remove {name}",
    removeTitle: "Remove from project",
    selectUser: "Select a user",
    addMember: "Add member",
    empty: "This project has no members yet.",
    removeDialog: {
      title: "Remove from the project?",
      leaves: "will no longer see the project",
      confirm: "Remove from project",
    },
  },
};
