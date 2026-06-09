# Inmobiliaria NZ

App de administración de alquileres en producción. **En reformulación** desde PHP procedural legacy hacia un stack moderno: **Laravel 12 + React 19 + MariaDB 11.8** sobre Docker.

El legacy sigue corriendo mientras se construye el nuevo en paralelo (ver `docs/roadmap.md`).

## Pre-requisitos

Lo único que necesitás en tu máquina:

- **Docker Desktop** ≥ 4.30 (Windows / macOS) o **Docker Engine** + **docker compose v2** (Linux).
- Git.

Nada de PHP, Composer, Node, pnpm o MariaDB en el host. Todo corre dentro de containers.

## Setup (4 pasos)

```bash
git clone <repo-url> Inmobiliaria-NZ
cd Inmobiliaria-NZ
cp .env.example .env            # opcional — solo si querés cambiar passwords/puertos/DB_DUMP_PATH
docker compose up -d --build    # tarda ~3-5 min la primera vez. Eso es todo.
```

El container de Laravel se auto-bootstrapea al arrancar: crea su `.env` desde `.env.example` y genera `APP_KEY` si falta. **Ningún comando manual extra.**

Cuando termine, abrí en el browser:

| URL                       | Qué es                                              |
|---------------------------|-----------------------------------------------------|
| http://localhost:8080     | App nueva (React + Laravel via Nginx).              |
| http://localhost:8081     | phpMyAdmin (login con `inmo` + password del `.env`).|
| http://localhost:8082     | Legacy PHP intacto.                                 |
| `localhost:3307`          | MariaDB para clientes externos (TablePlus, DBeaver).|

### DB de tests

Los tests Pest corren contra `inmobiliaria_test` (mismo container MariaDB). Se crea sola en el primer boot del volumen. Si tu volumen es anterior a sub-B, crearla una vez:

```bash
docker compose exec mariadb sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" < /docker-entrypoint-initdb.d/00-test-db.sql'
```

### Importar dump real (opcional)

En tu `.env`:

```
DB_DUMP_PATH=C:/Users/tu/secretos/db-nz.sql
```

Path **absoluto**. Si está vacío, MariaDB arranca con DB vacía y vos corrés migrations/seeders cuando quieras.

> ⚠️ El dump real tiene PII. **No commitearlo**. Está protegido por `.gitignore`.

## Comandos comunes

Vienen como scripts en `package.json` raíz (no requieren Node en host — son wrappers de `docker compose`):

```bash
docker compose up -d              # arranca todo
docker compose down               # para todo (mantiene datos)
docker compose down -v            # para todo + borra volúmenes (DB se pierde)
docker compose logs -f            # ver logs en vivo
docker compose ps                 # estado de servicios

# Backend
docker compose exec php-fpm sh                       # shell en container Laravel
docker compose exec php-fpm ./vendor/bin/pest        # tests Pest (usan inmobiliaria_test)
docker compose exec php-fpm ./vendor/bin/pint        # formato PHP
docker compose exec php-fpm php artisan <comando>    # cualquier artisan

# Frontend
docker compose exec node-dev sh                      # shell en container Vite
docker compose exec node-dev pnpm test               # tests Vitest
docker compose exec node-dev pnpm lint               # ESLint
```

## Estructura del repo

```
.
├── apps/
│   ├── api/        Laravel (PHP 8.4)
│   └── web/        React 19 + Vite 6 + TS
├── legacy/         PHP original — sigue funcionando hasta deprecate
├── docker/         Dockerfiles y configs por servicio
├── db/             migrations / seeders / backups (dump real fuera de git)
├── docs/           Roadmap, ADRs, specs, plans, changelog. Empezar por roadmap.md
├── .claude/        Reglas, commands y skills para Claude Code (ver CLAUDE.md)
├── docker-compose.yml
└── README.md
```

## ¿En qué fase estamos?

Mirá `docs/roadmap.md` para el estado de cada sub-proyecto (A–H). El presente sub-proyecto es **A — Infra + Bootstrap**.

## Más info

- `CLAUDE.md` — punto de entrada para el agente de IA y para humanos nuevos.
- `docs/architecture.md` — arquitectura global.
- `docs/changelog.md` — qué cambió en cada fase.
- `docs/adr/` — decisiones arquitectónicas grandes con su razón.
