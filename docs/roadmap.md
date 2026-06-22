 # Roadmap — Reformulación Inmobiliaria NZ

> Estado del plan maestro. Actualizar al cierre de cada fase. Última revisión: 2026-06-19.

## Visión

Reescribir la app PHP legacy a una arquitectura moderna sin perder funcionalidad y sumando mejoras. Stack destino: **Laravel 12 + React 19 + MariaDB 11.8 + Docker (PHP 8.5)**. La app actual sigue en producción hasta que el nuevo sistema esté listo.

## Principios

- **Una fase = un commit = un PR mergeado.** Los commits los hace el usuario.
- **Spec antes que código.** Cada sub-proyecto pasa por brainstorming + plan.
- **Migración incremental, no big bang.** El sistema viejo y el nuevo conviven durante la transición.
- **Seguridad de día 1.** Cada fase pasa `/security-review` antes de mergear.

## Sub-proyectos

| ID | Nombre | Estado | Depende de | Entregable corto |
|----|--------|--------|------------|------------------|
| **A** | Infra + Bootstrap | 🟢 DONE 2026-06-08 | — | `docker compose up` levanta Laravel + React + MariaDB + phpMyAdmin con dump auto-importado. |
| **B** | Schema + Migrations Laravel | 🟢 DONE 2026-06-09 | A | Migraciones, modelos Eloquent, factories y seeders que reproducen la DB actual. |
| **C** | Auth moderna | 🟢 DONE 2026-06-09 | B | Sanctum + rate limit + bcrypt + perfil + CSRF + rehash de usuarios MD5. |
| **D** | API REST CRUD | 🟢 DONE 2026-06-10 | C | Endpoints de ciudades, dueños, inquilinos, propiedades, contratos, recibos, formas de pago. |
| **E** | Frontend React core | 🟢 DONE 2026-06-15 | D | CRUD React de los 7 recursos (Ciudades, Formas de pago, Dueños, Inquilinos, Propiedades con foto, Contratos, Recibos) sobre fundación Sanctum + DataTable server-side + modales + react-query. PDFs diferidos a sub-F. |
| **F** | PDFs (recibos + rendiciones) | 🟢 DONE 2026-06-16 | D, E | Recibo individual, rendición a dueños y listado mensual de pagos en PDF desde Laravel (spatie/laravel-pdf + Gotenberg). Botones inline en la tabla de recibos + reporte mensual en el toolbar. |
| **G** | Dashboard / Inicio | 🟢 DONE 2026-06-16 | E, F | Pantalla de inicio (`/`) con totales, recibos pendientes del mes y contratos por vencer (90d). Endpoint agregado `GET /dashboard`. Sidebar colapsable + login redirige al inicio. |
| **I** | Envío por WhatsApp | 🟢 DONE 2026-06-17 (código) | F | Recibos→inquilino y rendiciones→dueño por **WhatsApp Cloud API oficial** desde la tabla de Recibos. Job encolado + log + marca "enviado". Pendiente: aprobar 2 plantillas en Meta + verificación de envío real. |
| **J** | Centro de mensajes WhatsApp (manual) | 🟢 DONE 2026-06-18 (mergeada `427c52a`) | I | Mensajes manuales con selección + preview + confirmación + progreso en vivo + historial: recordatorio de pago masivo y faltantes por inquilino (`/recordatorios`). Plantillas aprobadas en Meta y envío real verificado. |
| **H** | Deploy + CI/CD | ➡️ absorbida | — | **Reemplazada** por la Fase 7 del track Fusión NZ (deploy se hace junto con la unión de dominios). |

Leyenda: 🟢 DONE — 🟡 en progreso — ⚪ pendiente — 🔴 bloqueado — ➡️ movida/absorbida.

## Track Fusión NZ

Unificación del sitio público de venta `nz-estudio` (PHP vanilla) dentro de este monorepo. Diseño
aprobado 2026-06-19. Spec: `docs/superpowers/specs/2026-06-19-fusion-nz-design.md`. ADR-0009. El sitio
público sigue vivo en su hosting actual hasta el corte (Fase 7).

| # | Fase | Estado | Depende de | Entregable corto |
|---|------|--------|------------|------------------|
| **1** | Consolidación repo + docs | 🟢 DONE 2026-06-19 | A–J | Spec/ADR/roadmap unificados, `.env` confirmado, nz-estudio traído a `legacy-nz-estudio/` como referencia (sin secretos). Sin migrar código de negocio. |
| **2** | Dominio ventas en Laravel | 🟢 DONE 2026-06-19 | 1 | Migraciones + modelos + API REST `sale_properties`/`property_types`/`property_images` (lectura pública + CRUD admin); comando `ventas:import` (idempotente); imágenes WebP a `storage/app/public`. Pest 151 verdes; smoke real (51 props/68 imgs) verificado. |
| **3** | Auth + roles | 🟢 DONE 2026-06-19 | 2 | Tabla `roles` + FK `role_id` (NO spatie); roles `superadmin`/`inmobiliaria`; Gate `manage-sales` en escritura de ventas (403 a inmobiliaria); rol expuesto en `UserResource`; seeder asigna superadmin. Pest 158 verdes. |
| **4** | Admin de ventas (React) | 🟢 DONE 2026-06-22 | 3 | Sección "Propiedades en venta" en `apps/web` (solo `is_superadmin`): CRUD, ABM categorías, multi-upload + **reorder de fotos drag-drop** (pragmatic-dnd), vendidas, filtros. Vitest 52 verdes. (Reorder de filas de la tabla diferido.) |
| **5** | Sitio público (Next SSG) | ⚪ pendiente | 2, 4 | `apps/public`: home, catálogo+filtros, detalle, vendidas; OG por propiedad; rebuild-on-publish; servicio `public` en compose + reglas Next/SEO. |
| **6** | Motor PDF | ⚪ pendiente | — | Gotenberg → mPDF/dompdf (ADR-0004 revisado); reescribir y re-verificar los 3 PDFs de sub-F. |
| **7** | Deploy Hostinger + corte | ⚪ pendiente | 1–6 | CI/CD: admin → `admin.nz-...`, público Next SSG → `nz-...`; hook de rebuild; env/TLS/DB; baja del legacy de alquileres y del nz-estudio viejo. (Absorbe sub-H.) |

Roles destino: `superadmin` (Giuliano, ve todo) / `inmobiliaria` (staff y dueña Nadina, solo alquileres).

## Decisiones pendientes con impacto cruzado

- ADR-0001: **API-only vs Inertia.js** (afecta E principalmente).
- ADR-0002: **Rename tablas a inglés/snake_case vs preservar nombres legacy** (afecta B, D). ✅ cerrado.
- ADR-0003: **Deploy strategy** (Hostinger compartido vs VPS containerizado) (afecta H). La unión con el otro proyecto (`C:\laragon\www\nz-estudio`, PHP+Docker+GitHub Actions) como subdominio inclina a **VPS** con compose fusionado.
- ADR-0008: **Canal WhatsApp** — Cloud API oficial (Meta) vs BSP de pago / no oficial / wa.me (afecta I). Elegido: **Cloud API oficial**. ✅ cerrado.
- ADR-0004: **PDF lib** (spatie/laravel-pdf vs dompdf directo) (afecta F).
- ADR-0006: **OpenAPI autogenerada (scramble)** (afecta D, E). ✅ cerrado.
- ADR-0007: **Foto de propiedad en file storage WebP** (afecta D). ✅ cerrado.

Estas se resuelven cuando empieza la fase que las necesita, no antes.

## Bitácora

- **2026-06-08** — Inicio del roadmap. Estructura `docs/` + `.claude/rules/` scaffolded.
- **2026-06-08** — Sub-A DONE. Docker stack zero-touch funcionando con Laravel 13 + React 19 + MariaDB 11.8. Próximo: sub-B (schema + migrations).
- **2026-06-09** — Sub-B DONE. Migrations espejo + FKs gated + 8 modelos Eloquent + factories + 11 tests verdes contra MariaDB. ADR-0002 cerrado. Próximo: sub-C (auth).
- **2026-06-09** — Sub-C DONE. Sanctum stateful SPA + login con rate limit y rehash MD5→bcrypt transparente + perfil completo. 29 tests verdes. Security review sin hallazgos. Próximo: sub-D (API CRUD).
- **2026-06-10** — Sub-D DONE. API REST de los 7 recursos (apiResource + spatie/query-builder + 409 en FK RESTRICT), upload de foto WebP a disco, OpenAPI autogenerada con scramble. 83 tests verdes. ADR-0006 (scramble) y ADR-0007 (foto file storage) cerrados. Security review sin hallazgos. Próximo: sub-E (frontend) y sub-F (PDFs).
- **2026-06-12** — Sub-E fundación DONE. SPA real: Tailwind 4 + shadcn + RHF/zod + TanStack Table; auth Sanctum cookie (login/guard/401), layout navy NZ, DataTable server-side, slice CRUD Ciudades con 409. 9 tests (Vitest 3 + MSW). lint/build/typecheck verdes. Pendiente: `/security-review` del branch. Próximo: E2+ (CRUD del resto de recursos), sub-F (PDFs).
- **2026-06-15** — Sub-E DONE. CRUD React de los 7 recursos completo: a formas de pago/dueños/inquilinos/propiedades+foto/contratos se sumó **Recibos** (módulo `features/receipts/`, hoja → borrado directo, form de 8 montos + mes/año, filtros contrato/FP/mes/año, tabla con paridad legacy mostrando Contrato como "Dueño - Inquilino" y todas las columnas de montos). EntityCombobox FK, doble confirmación de borrado, paginación default 10, orden newest-first. Web **30 tests verdes**, lint/tsc verdes. PDFs del legacy de recibos (recibo individual, rendición, listado mensual) **diferidos a sub-F**. Próximo: sub-F (PDFs). Ver changelog 2026-06-15 para detalle.
- **2026-06-16** — Sub-F DONE. PDFs de recibo, rendición y listado mensual con spatie/laravel-pdf + **Gotenberg** (Chromium en container aparte, ADR-0004). Blades con branding NZ + logo/firma en base64; cálculos en `ReceiptCalculator`, número→letras con luecano, reporte mensual con query parametrizada (corrige SQLi del legacy). Botones-ícono inline (detalle + 2 PDF) en la tabla de recibos + modal de detalle + reporte mensual en el toolbar. Tablas: scroll horizontal solo al hacer zoom (no por defecto). Pest **97** + Vitest **34** verdes; los 3 PDFs verificados con render real (nuevo vs legacy). Próximo: sub-G (features nuevos) o sub-H (deploy/CI).
- **2026-06-17** — Sub-J DONE (código + tests), **redefinido** tras hablar con la dueña: de automático (cron) a **mensajes manuales** con selección + preview + confirmación + **progreso en vivo (lotes) + reintentar fallidos + historial unificado**. `whatsapp_messages` generalizada (batch/contract/name/body/template), `WhatsAppSender` + job `SendBulkReminder`, endpoints `whatsapp/*`, página `/recordatorios` (pago masivo + faltantes + historial). Se descartó la maquinaria automática (settings/cron/comando). Pest 132 + Vitest 42 verdes. Pendiente del usuario: 2 plantillas de texto en Meta. Próximo: sub-H (deploy) — última fase (incluye worker de cola para lotes grandes).
- **2026-06-17** — Sub-I DONE (código + tests). Envío por WhatsApp Cloud API oficial (ADR-0008): `WhatsAppClient` + job encolado + tabla `whatsapp_messages` + endpoint `POST receipts/{receipt}/whatsapp` + dialog en la tabla de Recibos con marca "enviado". `ReceiptPdf` refactor DRY, `PhoneNumber` E.164 (laravel-phone). Pest 122 + Vitest 39 verdes. Pendiente del usuario: aprobar 2 plantillas en Meta + verificación de envío real (canal ya validado con `hello_world`). Próximo: sub-J (recordatorios) o cerrar verificación de I.
- **2026-06-17** — Re-secuenciación. Antes de deploy se suman features: **sub-I (envío de recibos/rendiciones por WhatsApp Cloud API oficial)** y **sub-J (recordatorios)**. **sub-H (deploy) diferida** a última fase — depende de I, J + unión de dominios con el otro proyecto (`C:\laragon\www\nz-estudio`, PHP+Docker+Actions) como subdominio en VPS. Nuevos ADRs: 0008 (canal WhatsApp = Cloud API) y nota en 0003 (VPS). Sub-I arranca con brainstorming; Fase 0 = probar canal gratis con número de prueba de Meta antes de codear.
- **2026-06-18** — Sub-J ajustes UX (sobre el mismo branch, pre-merge). Feedback de la dueña: hora del tooltip "enviado" formateada (`formatDateTime`), íconos recibo/rendición → menú Ver/descargar + Enviar (se sacan los 2 botones de envío del `⋯`) en tabla y detalle, selector de mes/año en los paneles del pie (`DashboardController` acepta `month`/`year`), e historial guarda el texto real del mensaje de recibo/rendición (antes "Recibo #N (PDF)"). Pest 134 + Vitest 43 verdes; `/security-review` sin hallazgos. Sigue pendiente para mergear: aprobación de las 2 plantillas de recordatorios en Meta.
- **2026-06-16** — Sub-G DONE. Dashboard de inicio (`/`, landing post-login) — sin ingresos. 1ª ronda: totales, recibos pendientes del mes, contratos por vencer (90d). 2ª ronda (ampliación): accesos rápidos (abren forms vía `location.state.openCreate`), progreso del mes (barra), últimos recibos generados y contratos con saldo pendiente; la página de Recibos suma al pie "por hacer" + "hechos este mes". Endpoint agregado `GET /dashboard` (`DashboardData` + `Contract::scopeActive` + `DashboardResource`, queries parametrizadas sin input; suma `latestReceipts`/`contractsWithBalance`). Sidebar colapsable con transición (persistido) + login redirige al inicio. Pest **104** + Vitest **37** verdes; `/security-review` sin hallazgos. Próximo: sub-H (deploy/CI).
- **2026-06-19** — **Track Fusión NZ abierto** (fases 1–7). Se fusiona el sitio público de venta `nz-estudio` (PHP vanilla) dentro del monorepo. Diseño aprobado; spec `2026-06-19-fusion-nz-design.md` + ADR-0009. **sub-H absorbida** por la Fase 7 (deploy junto con la unión de dominios). Decisiones confirmadas: merge = copia como referencia, `.env` = patrón existente, dump local fuera de git, 2 roles (`superadmin`/`inmobiliaria`, sin rol especial dueña), `nz-administracion.net` hoy = legacy PHP. **Fase 1 (consolidación repo + docs) DONE**: nz-estudio traído a `legacy-nz-estudio/` (3.7 MB, sin secretos/uploads/dumps), spec + ADR-0009 + changelog; `/security-review` sin hallazgos. (commit `4c9343a`)
- **2026-06-19** — **Fusión NZ Fase 2 (dominio ventas) DONE**. 3 tablas inglés/snake_case (`property_types`/`sale_properties`/`property_images`) + modelos + factories; API REST con **lectura pública** (SSG) + **CRUD admin** (`auth:sanctum`), filtros spatie/query-builder, imágenes multi-upload WebP (reusa pipeline de `PropertyPhotoController`) + reorder; comando idempotente `ventas:import` (conexión `nzestudio`). Scramble autodocumenta los 8 endpoints. **Pest 151 verdes**; smoke real con el dump (7 tipos, 51 propiedades, 68 imágenes, 0 faltantes), API pública + imágenes sirviendo por HTTP 200. `/security-review` sin hallazgos. (commit `17bc7c6`)
- **2026-06-19** — **Fusión NZ Fase 3 (auth + roles) DONE**. Tabla `roles` + FK `role_id` en `users` (un rol por usuario; se **descartó** `spatie/laravel-permission` por overkill para 2 roles, y la columna string por preferir relación por id). Roles `superadmin`/`inmobiliaria`; Gate `manage-sales` (`isSuperadmin()`, null-safe) aplicado a **toda** la escritura de ventas → `inmobiliaria` recibe 403, lectura pública intacta; `UserResource` expone `role`/`is_superadmin` (para gatear la UI en Fase 4); `RoleSeeder` asigna `ggiuliano526@gmail.com`→superadmin (hardcodeado), resto→inmobiliaria. **Pest 158 verdes**; seed real verificado; `/security-review` sin hallazgos. (commit `e0ad2cb`)
- **2026-06-22** — **Fusión NZ Fase 4 (admin de ventas en React) DONE**. Sección "Propiedades en venta" en `apps/web`, **gateada por `is_superadmin`** (nav + ruta `RequireSuperadmin`; `User` del front suma `role`/`is_superadmin`). Feature `sales-properties/` espejando `features/properties`: CRUD con DataTable + filtros (categoría/vendida/`q`), form con campos + **multi-upload de fotos** (preview, borrar) + **reorder drag-drop** (`@atlaskit/pragmatic-drag-and-drop`), ABM de categorías (409 en uso), toggle vendida. **Vitest 52 verdes** (gating, CRUD, categorías, reorder util), lint + typecheck + build OK; `/security-review` sin hallazgos. Diferido: reorder drag-drop de **filas de la tabla** (invasivo sobre DataTable + mala UX con paginación). **Nota Fase 5**: sanitizar `map_embed` al renderizarlo (stored-XSS). Próximo: Fase 5 (sitio público Next SSG).
