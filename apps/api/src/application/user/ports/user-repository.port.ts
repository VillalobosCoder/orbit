import { User } from "../../../domain/user/user.entity.js";

export type UserPermissionAssignment = {
  module: string;
  canRead: boolean;
  canWrite: boolean;
};

export interface UserRepository {
  save(
    user: User,
    permissions: UserPermissionAssignment[],
    createdByUserId: number,
  ): Promise<void>;
  bootstrapInitialAdmin(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user: User): Promise<void>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  delete(id: number): Promise<void>;
}
