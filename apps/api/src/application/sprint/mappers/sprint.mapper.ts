import type { SprintDto } from "@orbit/shared";
import type { Sprint } from "../../../domain/sprint/sprint.entity.js";

export function toSprintDto(sprint: Sprint): SprintDto {
  return {
    id: sprint.id!,
    name: sprint.name,
    goal: sprint.goal,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    status: sprint.status,
  };
}
