# API setup

## Create the initial administrator

Run the database migrations first. Then set these variables in `apps/api/.env`:

```dotenv
BOOTSTRAP_ADMIN_NAME=Admin
BOOTSTRAP_ADMIN_LAST_NAME=Orbit
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=use-a-unique-password-of-at-least-8-characters
```

Run the one-time bootstrap command from the repository root:

```bash
pnpm --filter api bootstrap:admin
```

The command creates the first user and grants read/write access to every
configured module. It refuses to run if any user already exists. The operation
is transactional, so the user and permissions are either both created or
neither is created. Remove the bootstrap variables from `.env` after setup.

Afterward, sign in with the configured email and password. Create additional
users through `POST /api/users`, using an account with `users.write`.

## Database design

The data model and the decisions behind it are described in [docs/database.md](docs/database.md).

## Tests

Run them from the repository root with `pnpm test` (or `pnpm --filter api test:watch` while developing). `pnpm --filter api test:typecheck` type-checks the test files.

Everything lives in `apps/api/tests`, mirroring the layers of `src`:

| Folder | What it covers |
| --- | --- |
| `tests/domain/<entity>/` | Entities and value objects: their rules, with no mocks. |
| `tests/application/<entity>/` | One file per entity with a test for each of its use cases. Repositories and other ports are replaced by doubles. |
| `tests/infrastructure/` | Real pieces that run without a database: the token service, the password hasher, the environment loader and the HTTP middleware (tested through a real Express app on a random port). |
| `tests/support/` | Shared helpers: `stub()` for building port doubles, entity builders, fixtures and small test files for media. |

`stub<Port>({ method: ... })` only implements the methods a test gives it. Any other call throws, so a use case cannot quietly depend on something the test did not expect.

When you add a use case, add its test next to the ones of the same entity. The repositories that talk to PostgreSQL are not covered by these tests.
