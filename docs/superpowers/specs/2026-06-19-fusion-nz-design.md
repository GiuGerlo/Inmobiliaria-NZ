# Fusión NZ — Design (spec paraguas)

- **Fecha**: 2026-06-19
- **Estado**: aprobado
- **Tipo**: spec paraguas (track multi-fase 1–7; cada fase tiene además su propio spec/plan/commit).
- **Depende de**: fases A–J del roadmap original (admin de alquileres, todas DONE).

> Spec inmutable. Si la realidad cambia, se reemplaza con un spec nuevo (no se edita en silencio).

## Problema

Son **dos proyectos de la misma empresa** (Estudio Jurídico-Inmobiliario Nadina Zaranich), hoy en
repos y stacks separados:

- **Inmobiliaria-NZ** (este repo): admin de **alquileres**. Laravel 12 API + React 19 (Vite SPA) +
  MariaDB + Docker. Fases A–J hechas. Live de alquileres: `nz-administracion.net` (hoy = **legacy PHP**;
  el Laravel nuevo aún no está deployado).
- **nz-estudio** (`C:\laragon\www\nz-estudio`): **sitio público de venta de propiedades**. PHP
  procedural (mysqli), Bootstrap, dockerizado (Apache+PHP8.2+MariaDB), deploy a Hostinger por GitHub
  Actions. Live: `nz-estudiojuridicoinmobiliario.com`. SEO-crítico (Google + previews WhatsApp/Facebook).

Mantener dos stacks, dos DBs, dos auths y dos pipelines es costoso. Objetivo: **un repo, un Docker
local, un backend, una DB, un auth, dos dominios**, migrando el PHP vanilla a React/Next sin bajar el
sitio público durante la transición.

## Objetivo / arquitectura destino (aprobada)

Monorepo:

```
nz/ (este repo)
├── apps/
│   ├── api/      Laravel 12 — backend ÚNICO (alquileres + ventas), auth, API REST
│   ├── web/      React + Vite SPA — admin unificado  → admin.nz-estudiojuridicoinmobiliario.com
│   └── public/   Next.js (static export / SSG) — sitio público de venta → nz-estudiojuridicoinmobiliario.com
├── legacy/               (referencia del legacy de alquileres — ya existe)
├── legacy-nz-estudio/    (referencia del sitio público PHP — se trae en Fase 1)
├── docker-compose.yml    (LOCAL: api + web + public + mariadb + phpmyadmin + motor PDF)
├── db/                   (dumps locales, fuera de git)
├── docs/  .claude/  CLAUDE.md   (unificados)
└── .env                  (ÚNICO, centralizado)
```

**Datos: dos dominios separados, una sola DB + un solo auth.**
- Alquileres: tablas existentes (A–J).
- Ventas: tablas nuevas migradas de nz-estudio, en inglés/snake_case (ADR-0002):
  `propiedades`→`sale_properties`, `tipos_propiedad`→`property_types`,
  `imagenes_propiedades`→`property_images`. Imágenes WebP → `storage/app/public`.
- **Auth único con 2 roles** (`spatie/laravel-permission`):
  - `superadmin` — Giuliano. Ve todo, incluido ventas.
  - `inmobiliaria` — staff **y la dueña Nadina**. Solo alquileres.
  - (Sin rol especial de dueña: decisión confirmada 2026-06-19.)

**Hosting prod (Hostinger Premium actual — sin VPS, sin Vercel, $0 extra):**
- `nz-estudiojuridicoinmobiliario.com` → build estático de `apps/public` (Next SSG) por SSH/rsync.
- `admin.nz-estudiojuridicoinmobiliario.com` → `apps/api` (Laravel) + build de `apps/web` servido por Laravel.
- DB MariaDB de Hostinger.
- **Rebuild-on-publish**: el público es estático; al alta/baja/edición de propiedad (~2 altas + 1 baja
  por mes) se dispara rebuild+deploy automático (GitHub Action, ~1-2 min). El admin escribe en DB al
  instante; solo el reflejo público espera el rebuild.
- **Docker = solo desarrollo local.** En prod se deployan artefactos.
- **Camino futuro (~6 meses, al vencer el plan):** si se quiere SSR/ISR en vivo, subir a Hostinger
  Business (incluye Node.js) y flippear `apps/public` de `output: export` a SSR. Mismo código Next.
- Insumo ya existente: nz-estudio trae `.github/workflows/deploy.yml` + `scripts/deploy.sh` (SSH/rsync a
  Hostinger funcionando) → base para el pipeline de Fase 7.

**PDF:** Gotenberg (Chromium) no corre en Hostinger compartido → reemplazar por motor PHP puro (mPDF vs
dompdf, revisa ADR-0004 en Fase 6). Reescribir + re-verificar los 3 PDFs de sub-F.

## Decisiones confirmadas (2026-06-19)

1. **Merge de repos** = copia como referencia, sin historia git. El PHP de nz-estudio se reescribe a
   Next/React igual, así que su historial aporta poco. Va a `legacy-nz-estudio/`.
2. **nz-administracion.net hoy** = legacy PHP. El corte de alquileres es real y va en Fase 7.
3. **Roles** = solo 2 (`superadmin` / `inmobiliaria`), sin rol especial de dueña.
4. **Dump `nzestudio.sql`** = local, fuera de git (trae hashes/PII; consistente con `db/*.sql` ya ignorado).
5. **`.env` único** = se continúa el patrón existente (root `.env` → `docker-compose` → entrypoint deriva
   `apps/api/.env`). No se inventa mecanismo nuevo. (ADR-0009.)

## Descomposición en fases (orden aprobado — mantiene el público vivo hasta Fase 7)

1. **Consolidación repo + docs** — Traer nz-estudio como referencia + spec/ADR/roadmap unificados +
   `.env` confirmado. Sin migrar código de negocio. *(Esta fase.)*
2. **Dominio ventas en Laravel** — Migraciones + modelos + API REST (`sale_properties`, `property_types`,
   `property_images`). Migrar datos del dump. Imágenes WebP → `storage/app/public`. Tests Pest.
3. **Auth + roles** — `spatie/laravel-permission`: `superadmin` / `inmobiliaria`. Gate de la sección
   ventas. Unificar el user de nz-estudio en el auth existente. Tests.
4. **Admin de ventas (React)** — Sección "Propiedades en venta" en `apps/web`: CRUD, categorías, orden
   drag-drop, vendidas, multi-upload de fotos. Solo superadmin. Vitest + manual.
5. **Sitio público (Next SSG)** — `apps/public`: home, catálogo+filtros, detalle, vendidas. Consume API
   Laravel. Meta-tags/OG por propiedad. Rebuild-on-publish. Servicio `public` en compose + reglas Next/SEO.
6. **Motor PDF** — Gotenberg → mPDF/dompdf (ADR-0004 revisado). Reescribir y re-verificar los 3 PDFs.
7. **Deploy Hostinger + corte** — CI/CD: Laravel+admin → `admin.nz-...`; Next SSG → `nz-...`; hook de
   rebuild; env/TLS/DB; baja del legacy de alquileres y del nz-estudio viejo. (Absorbe la vieja sub-H.)

## Convenciones de trabajo (exigidas por el usuario)

- **Una fase = un ciclo `/fase-start` … `/fase-close`** (spec→plan→tasks→cierre).
- **`/security-review` en cada fase** antes de cerrar. Server-side validation, policies/roles, prepared
  statements, escape de salida, headers, uploads validados por mime real.
- **Nunca commitear `.env`, secretos, ni nada del `.gitignore`.** Revisar al traer archivos de nz-estudio.
- **Un solo `.env` centralizado** en la raíz como fuente de verdad.
- **Tests**: Pest (api) + Vitest (web) + tests Next (desde Fase 5). Verde antes de cerrar fase.
- **Testeo manual de TODO** en la app real (Docker local) antes de `/fase-close`.
- **Commits los hace el usuario**; el agente sugiere mensaje Conventional (≤50 chars, español).
- **Preguntar todo antes de actuar.** Ante duda, `AskUserQuestion`.

## Verificación (transversal)

- Por fase: Pest + Vitest (+ Next desde Fase 5) verdes + `/security-review` sin hallazgos + testeo manual.
- Fase 5/7: verificación real de SEO/OG (compartir un link de propiedad en WhatsApp y ver foto+título).
- Fase 7: smoke test en Hostinger de ambos dominios + rebuild-on-publish end-to-end.
