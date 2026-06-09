# Plan — Sub-B — Schema + Migrations Laravel

> Fuente: `docs/superpowers/specs/2026-06-09-sub-B-schema-migrations-design.md` (aprobado 2026-06-09).
> Branch: `fase/B-schema-migrations`.

## Pasos

### Step 1 — Test DB + config
- [x] `db/init/01-test-db.sql` crea `inmobiliaria_test` (+grants) — montado como `00-test-db.sql` en initdb.d (corre antes del dump).
- [x] `docker-compose.yml` actualizado con el mount.
- [x] `phpunit.xml` → mysql/mariadb/inmobiliaria_test.
- [x] Test DB verificada accesible con user `inmo`.

### Step 2 — Migrations dominio (espejo exacto)
- [x] 0001 ciudad, 0002 dueno, 0003 inquilino, 0004 propiedad (LONGBLOB via raw ALTER), 0005 formadepago, 0006 contrato, 0007 recibo.
- [x] Guard `Schema::hasTable` (baseline para DB con dump).
- [x] utf8mb4/utf8mb4_general_ci.

### Step 3 — users híbrida
- [x] Migration users del skeleton reescrita: columnas legacy + password nullable + remember_token; conserva password_reset_tokens y sessions.
- [x] `add_password_to_users` para DB existente (hasColumn guards).

### Step 4 — FKs + índices
- [x] `0001_01_02_000001_add_foreign_keys_and_indexes`: 8 FKs RESTRICT + índice compuesto `recibo(Mes_Rend, Ano_Rend)`. Idempotente via information_schema.

### Step 5 — Comando check-orphans
- [x] `legacy:check-orphans` — LEFT JOIN por relación, lista hasta 20 valores, exit 0/1.

### Step 6 — Modelos
- [x] City, Owner, Tenant, Property, Contract, PaymentMethod, Receipt, User. Inglés, `$table` legacy, `$timestamps=false`, casts, relationships completas, strict_types, final.

### Step 7 — Factories + seeders
- [x] 7 factories + UserFactory adaptada. Faker es_AR, cero PII.
- [x] `DemoSeeder` (5 ciudades, 10 dueños, 15 inquilinos, 15 propiedades, 12 contratos, 30 recibos, 3 FP). `DatabaseSeeder` solo en local.

### Step 8 — Tests
- [x] MigrationsTest (tablas + FK violation + índice).
- [x] ModelRelationsTest (cadena receipt→contract→owner→city, counts).
- [x] CheckOrphansCommandTest (limpio exit 0 / huérfano plantado exit 1).
- [x] SeederTest (counts).
- [x] **Suite: 11 passed (30 assertions).**

### Step 9 — Docs + cierre
- [x] ADR-0002 preservar nombres legacy.
- [x] Este plan.
- [x] Changelog + roadmap.
- [x] Verificación DB dev: migrate limpio + check-orphans OK + seed demo OK.

## Verificación ejecutada (2026-06-09)

```
pest                          → 11 passed (30 assertions)
artisan migrate (DB dev)      → 12 migrations DONE (DB estaba vacía → schema completo + FKs)
artisan legacy:check-orphans  → 8/8 OK, integridad OK
artisan db:seed               → DemoSeeder DONE
```

**Nota para cuando importes el dump real**: con `DB_DUMP_PATH` seteado y volumen recreado (`docker compose down -v && up`), correr `artisan migrate` (baseline skip) → `artisan legacy:check-orphans` → si hay huérfanos, corregirlos antes de que la migration de FKs aplique.

> ✅ DONE — 2026-06-09.
