# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report them privately through GitHub: open the **Security** tab of this repository and choose **Report a vulnerability**. Include the steps to reproduce it and what an attacker could do with it.

You will get an answer as soon as possible. Once the problem is fixed, it can be disclosed publicly.

## Running your own copy

Orbit is open source and anyone can fork it and deploy it. Each deployment is responsible for its own secrets:

- Never commit `.env` files, passwords, tokens or keys. They are ignored by git on purpose.
- Generate a new `JWT_SECRET` and a new database password for every deployment.
- If a secret is ever pushed by mistake, treat it as leaked: rotate it immediately. Deleting it from a later commit does not remove it from the history.
