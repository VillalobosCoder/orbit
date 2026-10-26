import type { ProjectIdRequestDto } from "@orbit/shared";

export type ProjectActorInput = ProjectIdRequestDto & {
  actorUserId: number;
};
