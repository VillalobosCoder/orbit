import { InvalidCredentialsError } from "../../../domain/user/user.errors.js";
import { exceedsPasswordByteLimit } from "../../../domain/user/password-policy.js";
import { PasswordHasher } from "../../user/ports/password-hasher.port.js";
import { UserRepository } from "../../user/ports/user-repository.port.js";
import { TokenService } from "../ports/token-service.port.js";

export interface LoginOutput {
  token: string;
  user: { id: number; name: string; email: string };
}

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    if (exceedsPasswordByteLimit(input.password)) {
      throw new InvalidCredentialsError();
    }

    const user = await this.usersRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.hasher.compare(
      input.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    if (this.hasher.needsRehash(user.password)) {
      const upgradedHash = await this.hasher.hash(input.password);
      await this.usersRepository.updatePassword(user.id!, upgradedHash);
    }

    const token = this.tokens.sign({ sub: String(user.id!) });

    return {
      token,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email.toString(),
      },
    };
  }
}
