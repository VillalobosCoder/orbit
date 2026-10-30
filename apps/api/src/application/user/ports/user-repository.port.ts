import type { UserIdRequestDto } from "@orbit/shared";
import { User } from "../../../domain/user/user.entity.js";
import type { Actor } from "../../shared/actor.js";

export type SetUserPasswordCommand = UserIdRequestDto &
  Actor & {
    passwordHash: string;
    mustChangePassword: boolean;
  };

export interface UserRepository {
  save(user: User, createdByUserId: number): Promise<number>;
  bootstrapInitialAdmin(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user: User, updatedByUserId: number): Promise<void>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  setPassword(command: SetUserPasswordCommand): Promise<void>;
  delete(id: number): Promise<void>;
}
