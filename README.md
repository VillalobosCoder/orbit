# Orbit

Project management for small teams: projects, scrum boards, sprints and issues in one place. The interface is in Spanish and English.

## Features

- **Projects** with members; the owner manages the team.
- **Board** with custom columns, drag and drop (mouse, touch and keyboard) and work-in-progress limits.
- **Sprints** and a planning view with a backlog.
- **Issues** with type, priority, difficulty, assignees, subtasks, start and due dates, estimate and story points.
- **Comments** and **photo and video attachments**, on issues and on comments.
- **Notifications** when a task is about to be due or overdue, when you are assigned one and when someone comments.
- **Users and permissions** per module and per project section.
- Light and dark theme.

## Stack

| Part | Technology |
| --- | --- |
| Web (`apps/web`) | React 19, Vite, Tailwind CSS 4, shadcn/ui on Base UI, TanStack Query and Table, React Router |
| API (`apps/api`) | Express 5, Drizzle ORM, PostgreSQL, Zod; layers: domain, application, infrastructure |
| Shared (`packages/shared`, `packages/i18n`) | Types, constants and the Spanish and English texts used by both sides |

## Run it locally

You need Node 24 (see `.nvmrc`), pnpm and Docker.

```bash
pnpm install
docker compose up -d
cp apps/api/.env.template apps/api/.env
```

Fill in `apps/api/.env`. For the local database from `compose.yml`:

| Variable | Value |
| --- | --- |
| `PORT` | `3000` |
| `HOSTNAME` | `127.0.0.1` |
| `DATABASE_URL` | `localhost` |
| `DATABASE_PORT` | `5432` |
| `DATABASE_NAME` | `orbit_db` |
| `DATABASE_USER` | `example` |
| `DATABASE_PASSWORD` | `example` |
| `DATABASE_SSL` | `false` |
| `JWT_SECRET` | the output of `openssl rand -hex 32` |
| `BOOTSTRAP_ADMIN_*` | name, last name, email and a password of at least 12 characters for the first administrator |

Then create the tables and the first administrator, and start both apps:

```bash
pnpm migration:run
pnpm --filter api bootstrap:admin
pnpm dev
```

The web opens at http://localhost:5173 and talks to the API at http://127.0.0.1:3000.

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | API and web with automatic reload |
| `pnpm typecheck` | Type-checks every package |
| `pnpm lint` | ESLint |
| `pnpm build` | Production build of the API and the web |
| `pnpm migration:run` | Applies the database migrations |
| `pnpm --filter api migration:generate --name <name>` | Creates a migration from the schema changes |

## Deploy

[docs/deployment.md](docs/deployment.md) explains step by step how to put Orbit on a VPS with Docker, a domain and HTTPS.

## Security

See [SECURITY.md](SECURITY.md) to report a vulnerability and for the rules about secrets when you fork this repository.

## License

[MIT](LICENSE)
