import type { Messages } from "../../translate.js";

export const shell: Messages["shell"] = {
  sidebar: {
    expand: "Expand menu",
    collapse: "Collapse menu",
    homeLink: "Orbit, home",
    projects: "Projects",
    noProjects: "You don't have any projects yet.",
    newProject: "New project",
    accountMenu: "Account menu",
    myProfile: "My profile",
    settings: "Settings",
    signOut: "Sign out",
    signingOut: "Signing out...",
    title: "Sidebar",
    mobileDescription: "Displays the mobile sidebar.",
    toggle: "Toggle sidebar",
    openNavigation: "Open navigation",
  },
  theme: {
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
  },
  guard: {
    loadingSession: "Loading session...",
  },
  notFound: {
    title: "You drifted too far from orbit.",
    description: "This page doesn't exist or you don't have access to it.",
  },
  forbidden: {
    title: "Access denied",
    description:
      "You don't have permission to access this screen. Contact your organization's administrator.",
  },
  routeError: {
    title: "Something went off orbit.",
    description:
      "An unexpected error occurred while showing this screen. Try reloading the page.",
  },
  ui: {
    closeDialog: "Close",
    closeToast: "Dismiss notification",
    showPassword: "Show password",
    hidePassword: "Hide password",
    sortBy: "Sort by {label}",
    pagination: "Pagination",
    noResults: "No results",
    showingRange: "Showing {from}–{to} of {total}",
    pageOf: "Page {page} of {lastPage}",
    previousPage: "Previous page",
    nextPage: "Next page",
  },
};
