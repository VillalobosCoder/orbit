# Deploy on a VPS with Docker

This guide takes Orbit from zero to an address with HTTPS, for example `https://orbit.yourdomain.com`. It is written for someone who has never deployed anything before.

## What gets started

Three long-running containers, defined in [compose.prod.yml](../compose.prod.yml):

| Container | What it is for | Exposed to the internet |
| --- | --- | --- |
| `caddy` | Serves the web app, forwards `/api` to the API and gets the HTTPS certificate on its own | Yes (ports 80 and 443) |
| `api` | The Orbit API | No |
| `postgres` | The database | No |

Data lives in Docker volumes: the database (`postgres_data`) and the photos and videos (`storage`). As long as you do not delete the volumes, they survive restarts and updates.

## 1. What you need

1. A **VPS** (for example Hostinger's). 1 vCPU and 2 GB of RAM are enough to start.
2. A **domain name**. It is not optional: without a domain there is no valid HTTPS, and without HTTPS the session does not work (the session cookie is `Secure`).
3. A computer with a terminal to connect over SSH.

### How to get a domain

A domain is the name people type, like `mydomain.com`. It is rented by the year.

1. Pick where to buy it. Well-known options: Hostinger itself, Namecheap, Porkbun or Cloudflare Registrar. Prices change, but a `.com` usually costs between 8 and 15 dollars a year; other endings (`.xyz`, `.site`) can cost a dollar or two the first year.
2. Search for the name you want, check that it is free and pay for it.
3. Turn on automatic renewal or note the expiry date: if it expires, your site stops working.

If you buy the domain from the same provider as the VPS, the configuration in the next step is usually a couple of clicks away.

### Try it before buying a domain

To see Orbit running with real HTTPS before buying anything, you can use a name that points to your IP, for example `203-0-113-10.sslip.io` (replace the numbers with your VPS IP, using dashes). Put that name in `DOMAIN` and Caddy will get a certificate. It works for testing; for production, buy your own domain.

## 2. Point the domain to the VPS

In your domain provider's panel, find the **DNS zone** (or "manage DNS") and create a record:

| Type | Name | Value |
| --- | --- | --- |
| `A` | `@` (or the subdomain, for example `orbit`) | the public IP of your VPS |

It can take from a few minutes to a few hours to propagate. To check it from your computer:

```bash
ping yourdomain.com
```

It must answer with the IP of your VPS.

## 3. Prepare the VPS

When creating the VPS, pick an **Ubuntu 24.04** image (if there is one with Docker preinstalled, use it). Connect over SSH with the IP and the password or key your provider gave you:

```bash
ssh root@VPS_IP
```

If Docker is not installed:

```bash
curl -fsSL https://get.docker.com | sh
```

Open only the ports you need with the firewall:

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw enable
```

Recommended: sign in with an SSH key instead of a password and turn off password access.

## 4. Get the code and configure it

```bash
git clone https://github.com/YOUR_USER/orbit.git
cd orbit
cp .env.production.example .env
```

Edit `.env` (for example with `nano .env`):

| Variable | What to put |
| --- | --- |
| `DOMAIN` | your domain, without `https://`, for example `orbit.yourdomain.com` |
| `POSTGRES_PASSWORD` | a long password; generate it with `openssl rand -hex 24` |
| `JWT_SECRET` | another secret; generate it with `openssl rand -hex 32` |
| `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_LAST_NAME` | name and last name of the first administrator |
| `BOOTSTRAP_ADMIN_EMAIL` | their email |
| `BOOTSTRAP_ADMIN_PASSWORD` | a password of at least 8 characters; use a long one anyway |

Save those values in your password manager. **The `.env` file must never be pushed to GitHub**: git already ignores it. Because this repository is public, any password that gets pushed is visible to everyone, even if you delete it later.

## 5. Start everything

```bash
docker compose -f compose.prod.yml up -d --build
docker compose -f compose.prod.yml --profile tools run --rm migrate
docker compose -f compose.prod.yml --profile tools run --rm admin
```

- The first line builds the images and starts the web app, the API and the database. The first time it takes a few minutes.
- `migrate` creates the tables.
- `admin` creates the first administrator with the data from `.env`.

Open `https://yourdomain.com` and sign in with that administrator. Caddy requests the HTTPS certificate automatically the first time; if DNS has not propagated yet, wait a few minutes and try again.

After creating the administrator you can delete `BOOTSTRAP_ADMIN_PASSWORD` from `.env`.

## 6. Update to a new version

```bash
cd orbit
git pull
docker compose -f compose.prod.yml up -d --build
docker compose -f compose.prod.yml --profile tools run --rm migrate
```

## 7. Backups

The [deploy/backup.sh](../deploy/backup.sh) script saves a database dump and an archive of the photos and videos in `backups/`, and deletes copies older than 14 days:

```bash
./deploy/backup.sh
```

To run it by itself every night:

```bash
crontab -e
```

and add (adjust the path):

```
0 3 * * * cd /root/orbit && ./deploy/backup.sh >> backups/backup.log 2>&1
```

A copy that lives only on the same VPS does not save you if the VPS is lost. Download the copies somewhere else from time to time, or turn on your VPS provider's own backups.

To restore the database from a dump:

```bash
gunzip -c backups/db-DATE.sql.gz | docker compose -f compose.prod.yml exec -T postgres psql -U orbit orbit
```

## 8. Useful commands

```bash
docker compose -f compose.prod.yml ps          # state of the containers
docker compose -f compose.prod.yml logs -f api # API logs
docker compose -f compose.prod.yml restart api # restart the API
docker compose -f compose.prod.yml down        # shut down (data is kept)
```

Do not use `down -v`: the `-v` deletes the volumes, that is, the database and the files.

## Common problems

- **Caddy does not get the certificate.** Check that the `A` record points to the VPS IP, that ports 80 and 443 are open, and look at `docker compose -f compose.prod.yml logs caddy`.
- **I sign in but the session closes or does not start.** The web app must be opened over `https://`. Over `http://` the session cookie is discarded.
- **The API does not start.** Look at `docker compose -f compose.prod.yml logs api`. If a variable is missing, the message says which one.
- **I forgot the administrator's password.** Another user with the users permission can reset it from the Users screen.

## If someone forks this repository

Each fork is deployed with its own secrets. Nothing it needs to run is in the repository: only the [.env.production.example](../.env.production.example) template with empty values. See [SECURITY.md](../SECURITY.md).
