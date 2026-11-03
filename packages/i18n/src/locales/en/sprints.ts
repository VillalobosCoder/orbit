import type { Messages } from "../../translate.js";

export const dates: Messages["dates"] = {
  noDates: "No dates",
  noStart: "no start",
  noEnd: "no end",
  endsToday: "ends today",
  overdue: "overdue",
  days: { one: "{count} day", other: "{count} days" },
  until: "until {date} · {remaining}",
};

export const sprints: Messages["sprints"] = {
  status: { planned: "Planned", active: "Active", closed: "Closed" },
  planning: {
    title: "Planning",
    description: "Organize issues into sprints and keep the backlog up to date.",
    newSprint: "New sprint",
    newIssue: "New issue",
    moveTo: "Move {key} to",
    progress: "{done} / {total} done",
    progressLabel: "Issues done",
    start: "Start",
    complete: "Complete sprint",
    noIssues: "No issues.",
    backlog: "Backlog",
    issueCount: { one: "{count} issue", other: "{count} issues" },
    history: "Sprint history",
    closedBadge: "Closed",
    completeDialog: {
      title: "Complete {name}?",
      pending: {
        one: "{count} unfinished issue will go back to the backlog.",
        other: "{count} unfinished issues will go back to the backlog.",
      },
      allDone:
        "All of its issues are done. The sprint will move to the history.",
      confirm: "Complete sprint",
    },
    deleteDialog: {
      title: "Delete {name}?",
      description: "Its issues will go back to the backlog.",
      confirm: "Delete sprint",
    },
  },
  form: {
    editTitle: "Edit sprint",
    newTitle: "New sprint",
    editDescription: "Edit the details of {name}.",
    newDescription:
      "It starts as “Planned”. There can only be one active sprint at a time.",
    goal: "Goal",
    startDate: "Start",
    endDate: "End",
    invalidRange: "The end date cannot be before the start date.",
    duration: {
      one: "Duration: {count} day",
      other: "Duration: {count} days",
    },
    create: "Create sprint",
  },
};
