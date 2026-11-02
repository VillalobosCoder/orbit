import { auth, profile } from "./account.js";
import { api, common } from "./common.js";
import { errors } from "./errors.js";
import { home } from "./home.js";
import { catalog, issues } from "./issues.js";
import { projects } from "./projects.js";
import { settings } from "./settings.js";
import { dates, sprints } from "./sprints.js";
import { modules, users } from "./users.js";
import { shell } from "./shell.js";

export const es = {
  common,
  api,
  errors,
  shell,
  settings,
  auth,
  profile,
  users,
  modules,
  projects,
  dates,
  sprints,
  home,
  issues,
  catalog,
};
