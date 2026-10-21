import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq, ne } from "drizzle-orm";
import { UserRepository } from "../../../application/user/ports/user-repository.port.js";
import { User } from "../../../domain/user/user.entity.js";
import { UserStatusKey } from "@orbit/shared";
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../../../domain/user/user.errors.js";
import { users } from "../schema/users.js";

function isEmailUniqueViolation(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    !("constraint" in error)
  ) {
    return false;
  }

  return error.code === "23505" && error.constraint === "users_email_unique";
}

export class DBUserRepository implements UserRepository {
  constructor(private readonly db: NodePgDatabase) {}

  async save(user: User): Promise<void> {
    const data = user.toPrimitives();

    try {
      await this.db
        .insert(users)
        .values({
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          statusKey: UserStatusKey.ACTIVE,
        })
    } catch (error) {
      if (isEmailUniqueViolation(error)) {
        throw new UserAlreadyExistsError(data.email);
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email.trim().toLowerCase()),
          ne(users.statusKey, UserStatusKey.DELETED),
        ),
      )
      .limit(1);

    return row ? User.fromPersistence(row) : null;
  }

  async findById(id: number): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, id),
          ne(users.statusKey, UserStatusKey.DELETED),
        ),
      )
      .limit(1);

    return row ? User.fromPersistence(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db
      .select()
      .from(users)
      .where(ne(users.statusKey, UserStatusKey.DELETED));
    return rows.map((row) => User.fromPersistence(row));
  }

  async update(user: User): Promise<void> {
    const { id, ...data } = user.toPrimitives();

    try {
      const [row] = await this.db
        .update(users)
        .set({
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(users.id, id!),
            ne(users.statusKey, UserStatusKey.DELETED),
          ),
        )
        .returning({ id: users.id });

      if (!row) {
        throw new UserNotFoundError(id!);
      }
    } catch (error) {
      if (isEmailUniqueViolation(error)) {
        throw new UserAlreadyExistsError(data.email);
      }

      throw error;
    }
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    const [row] = await this.db
      .update(users)
      .set({
        password: passwordHash,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(users.id, id),
          ne(users.statusKey, UserStatusKey.DELETED),
        ),
      )
      .returning({ id: users.id });

    if (!row) {
      throw new UserNotFoundError(id);
    }
  }

  async delete(id: number): Promise<void> {
    const [row] = await this.db
      .update(users)
      .set({
        statusKey: UserStatusKey.DELETED,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(users.id, id),
          ne(users.statusKey, UserStatusKey.DELETED),
        ),
      )
      .returning({ id: users.id });

    if (!row) {
      throw new UserNotFoundError(id);
    }
  }
}
