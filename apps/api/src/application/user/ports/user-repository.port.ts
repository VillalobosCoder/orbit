import type { UserIdRequestDto } from "@orbit/shared";
import { User } from "../../../domain/user/user.entity.js";
import type { Actor, ActorUserId } from "../../shared/actor.js";

export type SetUserPasswordCommand = UserIdRequestDto &
  Actor & {
    passwordHash: string;
    mustChangePassword: boolean;
  };

export interface UserRepository {
  save(user: User, actorUserId: ActorUserId): Promise<number>;
  bootstrapInitialAdmin(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user: User, actorUserId: ActorUserId): Promise<void>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  setPassword(command: SetUserPasswordCommand): Promise<void>;
  delete(id: number): Promise<void>;
}
