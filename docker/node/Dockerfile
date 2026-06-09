# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine

# pnpm 9 vía corepack. pnpm 10 trata "ignored build scripts" como fatal — diferimos
# upgrade a 10 hasta que el ecosistema (esbuild, etc.) tenga aprobación granular madura.
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /var/www/web

# Layer cache: copiamos solo manifest si existen.
# Primera build (sin apps/web todavía): se saltea.
COPY apps/web/package.json* apps/web/pnpm-lock.yaml* ./
RUN if [ -f package.json ]; then \
      pnpm install --frozen-lockfile || pnpm install; \
    fi

EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
