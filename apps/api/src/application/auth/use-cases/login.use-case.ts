import { randomUUID } from "node:crypto";
import { InvalidCredentialsError } from "../../../domain/user/user.errors.js";
import { Password } from "../../../domain/user/value-objects/password.vo.js";
import { PasswordHasher } from "../../user/ports/password-hasher.port.js";
import { UserRepository } from "../../user/ports/user-repository.port.js";
import { TokenService } from "../ports/token-service.port.js";
import type { UserPermissionRepository } from "../ports/user-permission-repository.port.js";
import type { AuthenticatedUserDto } from "@orbit/shared";
import { buildAvatarUrl } from "../../user/utils/avatar-url.js";

export interface LoginOutput {
  token: string;
  user: AuthenticatedUserDto;
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
    private readonly permissions: UserPermissionRepository,
  ) {}

  private dummyHash?: Promise<string>;

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher.hash(randomUUID());

    return this.dummyHash;
  }

  async execute(input: LoginInput): Promise<LoginOutput> {
    if (Password.exceedsByteLimit(input.password)) {
      throw new InvalidCredentialsError();
    }

    const user = await this.usersRepository.findByEmail(input.email);

    if (!user) {
      await this.hasher.compare(input.password, await this.getDummyHash());
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
      await this.usersRepository.updatePassword(user.persistedId, upgradedHash);
    }

    const token = this.tokens.sign({
      sub: String(user.persistedId),
      mustChangePassword: user.mustChangePassword,
    });
    const permissions = await this.permissions.findByUserId(user.persistedId);

    return {
      token,
      user: {
        id: user.persistedId,
        name: user.name,
        lastName: user.lastName,
        email: user.email.toString(),
        avatarUrl: buildAvatarUrl(user.persistedId, user.avatarFileId),
        permissions,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }
}
