import type { Messages } from "../../translate.js";

export const home: Messages["home"] = {
  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  },
  noAccess:
    "A summary of your projects will appear here once you have access to them.",
  summary: {
    projects: "Projects",
    withActiveSprint: "{count} with an active sprint",
    assigned: "Assigned to you",
    inProgress: "{count} in progress",
    closing: "Closing this week",
    sprintToClose: { one: "sprint to close", other: "sprints to close" },
  },
  assigned: {
    title: "Assigned to you",
    showing: "Showing {shown} of {total} assigned issues",
    count: { one: "{count} assigned issue", other: "{count} assigned issues" },
  },
  sprints: {
    title: "Active sprints",
    noActive: {
      one: "No active sprint · {count} issue in the backlog",
      other: "No active sprint · {count} issues in the backlog",
    },
    progress: "Progress of {name}",
    done: "{done} of {total} done",
  },
};
