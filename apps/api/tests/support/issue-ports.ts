import type { IssueCatalogRepository } from "../../src/application/issue/ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../../src/application/issue/ports/issue-repository.port.js";
import type { NotificationRepository } from "../../src/application/notification/ports/notification-repository.port.js";
import type { ProjectMemberRepository } from "../../src/application/project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../src/application/project/ports/project-repository.port.js";
import type { SprintRepository } from "../../src/application/sprint/ports/sprint-repository.port.js";
import { aProject } from "./builders.js";
import {
  anIssue,
  columns,
  difficulties,
  issueTypes,
  members,
  priorities,
} from "./fixtures.js";
import { stub } from "./stub.js";

export function projectsDouble(isMember = true) {
  return stub<ProjectRepository>({
    findByIdForMember: async () => (isMember ? aProject() : null),
    nextIssueNumber: async () => 8,
  });
}

export function catalogDouble() {
  return stub<IssueCatalogRepository>({
    findColumns: async () => columns,
    findIssueTypes: async () => issueTypes,
    findPriorities: async () => priorities,
    findDifficulties: async () => difficulties,
  });
}

export function membersDouble() {
  return stub<ProjectMemberRepository>({ findMembers: async () => members });
}

export function notificationsDouble() {
  return stub<NotificationRepository>({
    notify: async () => undefined,
    deleteDueForIssue: async () => undefined,
  });
}

export function issuesDouble(existing = anIssue()) {
  return stub<IssueRepository>({
    findById: async () => existing,
    findLastBoardPosition: async () => 1024,
    save: async () => 100,
    update: async () => undefined,
    replaceAssignees: async () => undefined,
    setChildrenSprint: async () => undefined,
    hasChildren: async () => false,
    findAllByProject: async () => [],
    releaseFromSprint: async () => undefined,
    delete: async () => undefined,
  });
}

export function sprintsDouble(sprint: ReturnType<typeof import("./fixtures.js").aSprint> | null) {
  return stub<SprintRepository>({ findById: async () => sprint });
}
