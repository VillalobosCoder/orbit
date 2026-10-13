import { Email } from "./value-objects/email.vo.js";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type UserPrimitives = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};

type UserProps = {
  id?: number;
  name: string;
  email: Email;
  password: string;
  createdAt: Date;
};

export class User {
  private constructor(private readonly props: Readonly<UserProps>) {}

  static register(input: RegisterUserInput): User {
    return new User({
      name: input.name.trim(),
      email: Email.create(input.email),
      password: input.password,
      createdAt: new Date(),
    });
  }

  static fromPersistence(data: UserPrimitives): User {
    return new User({
      id: data.id,
      name: data.name,
      email: Email.create(data.email),
      password: data.password,
      createdAt: data.createdAt,
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }
  
  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPrimitives(): Omit<UserPrimitives, "id"> & { id?: number } {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email.toString(),
      password: this.props.password,
      createdAt: this.props.createdAt,
    };
  }
}
