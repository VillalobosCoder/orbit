import { Email } from "./value-objects/email.vo.js";

export type RegisterUserInput = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  mustChangePassword?: boolean;
};

export type UserPrimitives = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  password: string;
  mustChangePassword: boolean;
  createdAt: Date;
};

type UserProps = {
  id?: number;
  name: string;
  lastName: string;
  email: Email;
  password: string;
  mustChangePassword: boolean;
  createdAt: Date;
};

export class User {
  private constructor(private readonly props: Readonly<UserProps>) {}

  static register(input: RegisterUserInput): User {
    return new User({
      ...User.normalizeProfile(input),
      password: input.password,
      mustChangePassword: input.mustChangePassword ?? false,
      createdAt: new Date(),
    });
  }

  static fromPersistence(data: UserPrimitives): User {
    return new User({
      id: data.id,
      name: data.name,
      lastName: data.lastName,
      email: Email.create(data.email),
      password: data.password,
      mustChangePassword: data.mustChangePassword,
      createdAt: data.createdAt,
    });
  }

  withProfile(input: {
    name: string;
    lastName: string;
    email: string;
  }): User {
    return new User({ ...this.props, ...User.normalizeProfile(input) });
  }

  private static normalizeProfile(input: {
    name: string;
    lastName: string;
    email: string;
  }) {
    return {
      name: input.name.trim(),
      lastName: input.lastName.trim(),
      email: Email.create(input.email),
    };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get mustChangePassword(): boolean {
    return this.props.mustChangePassword;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPrimitives(): Omit<UserPrimitives, "id"> & { id?: number } {
    return {
      id: this.props.id,
      name: this.props.name,
      lastName: this.props.lastName,
      email: this.props.email.toString(),
      password: this.props.password,
      mustChangePassword: this.props.mustChangePassword,
      createdAt: this.props.createdAt,
    };
  }
}
