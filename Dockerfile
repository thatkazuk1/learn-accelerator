# syntax=docker/dockerfile:1.7

FROM node:20.12.2-alpine3.19 AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.6.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:core && pnpm build

FROM nginxinc/nginx-unprivileged:1.27.4-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist/ /usr/share/nginx/html/

EXPOSE 8080
