FROM node:24-alpine AS base
RUN npm install --global pnpm@12.9.1
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/i18n/package.json packages/i18n/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter api build && pnpm --filter web build
RUN pnpm --filter api --prod deploy /out/api

FROM build AS tools
WORKDIR /app/apps/api
CMD ["pnpm", "migration:run"]

FROM node:24-alpine AS api
ENV NODE_ENV=production
WORKDIR /app
RUN mkdir -p /data/storage && chown -R node:node /data
COPY --from=build /out/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]

FROM caddy:2-alpine AS caddy
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv
