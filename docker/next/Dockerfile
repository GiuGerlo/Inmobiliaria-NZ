# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine

# pnpm 9 vía corepack (mismo criterio que docker/node — ver ese Dockerfile).
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /var/www/public

# Layer cache: copiamos solo manifest si existe.
# Primera build (sin apps/public todavía): se saltea.
COPY apps/public/package.json* apps/public/pnpm-lock.yaml* ./
RUN if [ -f package.json ]; then \
      pnpm install --frozen-lockfile || pnpm install; \
    fi

EXPOSE 3000
CMD ["pnpm", "dev"]
