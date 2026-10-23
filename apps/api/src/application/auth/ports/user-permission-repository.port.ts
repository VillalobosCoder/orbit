import type { UserPermissionDto } from "@orbit/shared";

export type PermissionAction = "read" | "write";

export interface UserPermissionRepository {
  findByUserId(userId: number): Promise<UserPermissionDto[]>;
  hasPermission(
    userId: number,
    moduleKey: string,
    action: PermissionAction,
  ): Promise<boolean>;
}
