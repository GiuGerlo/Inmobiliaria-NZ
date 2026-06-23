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

El container de Laravel se auto-bootstrapea al arrancar (`docker/php/entrypoint.sh`): crea su `.env` desde `.env.example`, genera `APP_KEY`, **corre las migraciones y seedea la base si está vacía**. **Cero comandos manuales** — al terminar el `up` ya podés loguearte.

Cuando termine, abrí en el browser:

| URL                       | Qué es                                              |
|---------------------------|-----------------------------------------------------|
| http://localhost:8080     | App nueva (React + Laravel via Nginx).              |
| http://localhost:8081     | phpMyAdmin (login con `inmo` + password del `.env`).|
| http://localhost:8082     | Legacy PHP intacto.                                 |
| `localhost:3307`          | MariaDB para clientes externos (TablePlus, DBeaver).|

### Usuarios de prueba (ya creados por el seed automático)

El primer `docker compose up` migra y seedea solo. Quedan **dos perfiles** listos para entrar a http://localhost:8080, ambos con password **`password`**:

| Email             | Password   | Rol            | Ve                       |
|-------------------|------------|----------------|--------------------------|
| `super@nz.com`    | `password` | **superadmin** | Todo (incl. ventas)      |
| `demo@example.com`| `password` | inmobiliaria   | Solo alquileres          |

> La sección **"Propiedades en venta"** es solo-superadmin: entrá con **`super@nz.com`** para verla.
>
> El seed **solo corre si la base está vacía** — nunca pisa datos existentes. Para re-seedear a mano: `docker compose exec php-fpm php artisan db:seed`.
>
> El seed también carga **datos demo de ventas**: 6 categorías + 8 propiedades en venta (sin fotos — las imágenes necesitan archivos reales). Para datos/fotos reales, importá el dump con `php artisan ventas:import` (ver `docs/plans/sub-fusion-2-ventas-plan.md`).
>
> En **producción** el superadmin se define por `SUPERADMIN_EMAIL` en el `.env` (no se hardcodea ningún email).

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

Path **absoluto**. Si está vacío, MariaDB arranca limpia y el entrypoint de Laravel migra + seedea solo (usuarios de prueba de arriba).

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

Mirá `docs/roadmap.md` para el estado actualizado. Los sub-proyectos base **A–J están DONE** y está en curso el **track Fusión NZ** (integrar el sitio público de venta al monorepo, 7 fases): **Fases 1–4 DONE** (consolidación, dominio ventas en Laravel, auth+roles, admin de ventas en React). Próximo: **Fase 5 — sitio público (Next SSG)**.

## Más info

- `CLAUDE.md` — punto de entrada para el agente de IA y para humanos nuevos.
- `docs/architecture.md` — arquitectura global.
- `docs/changelog.md` — qué cambió en cada fase.
- `docs/adr/` — decisiones arquitectónicas grandes con su razón.
