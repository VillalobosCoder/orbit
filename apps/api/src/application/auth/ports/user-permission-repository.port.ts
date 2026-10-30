import type { UserPermissionDto } from "@orbit/shared";
import type { ActorUserId } from "../../shared/actor.js";

export type PermissionAction = "read" | "write";

export interface UserPermissionRepository {
  findByUserId(userId: number): Promise<UserPermissionDto[]>;
  replaceForUser(
    userId: number,
    permissions: UserPermissionDto[],
    actorUserId: ActorUserId,
  ): Promise<void>;
  hasPermission(
    userId: number,
    moduleKey: string,
    action: PermissionAction,
  ): Promise<boolean>;
}
