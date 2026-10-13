import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { UserRepository } from "../../../application/user/ports/user-repository.port.js";
import { User } from "../../../domain/user/user.entity.js";
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
          email: data.email,
          password: data.password,
          createdAt: new Date(),
          statusId: 1,
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
      .where(eq(users.email, email.trim()))
      .limit(1);

    return row ? User.fromPersistence(row) : null;
  }

  async findById(id: number): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return row ? User.fromPersistence(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db.select().from(users);
    return rows.map((row) => User.fromPersistence(row));
  }

  async update(user: User): Promise<void> {
    const { id, ...data } = user.toPrimitives();

    try {
      const [row] = await this.db
        .update(users)
        .set({
          name: data.name,
          email: data.email,
          password: data.password,
          modifiedAt: new Date(),
        })
        .where(eq(users.id, id!))
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
        modifiedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!row) {
      throw new UserNotFoundError(id);
    }
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
