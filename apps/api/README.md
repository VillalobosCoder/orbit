# API setup

## Create the initial administrator

Run the database migrations first. Then set these variables in `apps/api/.env`:

```dotenv
BOOTSTRAP_ADMIN_NAME=Admin
BOOTSTRAP_ADMIN_LAST_NAME=Orbit
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=use-a-unique-password-of-at-least-12-characters
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
