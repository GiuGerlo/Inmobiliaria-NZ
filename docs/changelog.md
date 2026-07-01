# Changelog

Historial de cambios por fase. Más reciente arriba.

## [2026-07-01] Fusión NZ Fase 7 — Pipeline de deploy (API en dev) — EN PROGRESO

**Resumen**: Se robustece el CI/CD de deploy (GitHub Actions + rsync a Hostinger compartido, ADR-0003)
y se hace el **primer deploy real del API + admin a la instancia `dev`** (verde: migrate bajo
mantenimiento + health check 200). La fase sigue abierta: falta datos, deploy-public, cron y el corte a prod.

**Cambios**:
- **Workflows** `deploy-api.yml` / `deploy-public.yml` reforzados: cache composer/pnpm; **backups por
  corrida** en `backups/` a nivel del dominio (junto a `public_html`, fuera del webroot,
  `<dominio>/backups/<env>/{api,public}/<ts>/`: dump DB `mysqldump|gzip` +
  `files-replaced/` vía `rsync --backup-dir`), retención 5 con poda; **reporte** de archivos
  nuevos/modificados/borrados (lista + `--stats`) en el summary; **ventana de mantenimiento** en el API
  (`down → rsync → migrate → up`, con `up` en `if: always()`); **health check** post-deploy; input manual
  **`force_full`** (rsync `--checksum`); excludes ampliados (no sube docs/meta/`storage/framework`).
- **Fixes del pipeline** (detectados en el primer deploy): crear `storage/framework/{views,cache,sessions}`
  en el runner antes de `composer install` (evita `package:discover` → "valid cache path"); PHP CLI del
  server = ruta absoluta `/opt/alt/php84/usr/bin/php` (el CLI default es 8.2); "Mantenimiento OFF" solo
  corre si "ON" se ejecutó.
- **Endpoint** `GET /api/v1/health` suma `env` (`app()->environment()`).
- **ADR-0003** escrito y **cerrado** (Hostinger compartido + rsync; sin rollback automático).
- **Runbook** `fase7-pasos-manuales.md`: `.env` dev, binario PHP 8.4, cron con php84, seed `RoleSeeder`
  post-primer-deploy, sección de backups/restore/`force_full`.
- **Infra dev**: subdominios `admin-dev.`/`dev.`, DB `nz_dev`, llave SSH de deploy, secrets del env `dev`,
  `.env` del server; rama `dev` creada.

**Breaking**: nada.
**Migración**: el `.env` del server debe existir antes del primer deploy (con `APP_KEY` + DB); tras el
primer `migrate` correr `db:seed --class=RoleSeeder --force` (crea roles + promueve `SUPERADMIN_EMAIL`).

## [2026-06-29] Fusión NZ Fase 6 — Motor PDF (Gotenberg → dompdf) — DONE

**Resumen**: Se migra el motor de los 3 PDFs (recibo, rendición, listado mensual) de **Gotenberg**
(Chromium en container) a **dompdf** (PHP puro), porque prod = Hostinger compartido sin Docker (donde
Gotenberg no corre). Desbloquea el deploy del admin (Fase 7). Se mantiene `spatie/laravel-pdf` como capa
de abstracción → la API de render no cambia; el diff es config + CSS.

**Cambios**:
- **Driver**: `LARAVEL_PDF_DRIVER=gotenberg` → `dompdf` en `.env`/`.env.example`; se quita `GOTENBERG_URL`. `composer require dompdf/dompdf` (^3.1).
- **Blades flex→tabla** (dompdf no soporta flexbox): `brand-header`/`brand-left` (`layout.blade` + partial) y `.parties` (`receipt.blade`) pasan a layout por `<table>`. Se borra el bloque `:root` sin uso (los colores ya eran hex literales). `settlement` y `monthly-payments` ya eran table-based → sin cambios.
- **Infra**: servicio `gotenberg` eliminado de `docker-compose.yml` (+ su `depends_on` en `php-fpm`). Sin Chromium en el stack.
- **Sin tocar**: `ReceiptPdf`, `PdfAsset` (solo se actualizó su docblock), `ReceiptPdfController`, `MonthlyPaymentsReportController`, `ReceiptCalculator`, `MonthlyPaymentsReport` — la API `Pdf::view()->format()->landscape()->inline()` funciona igual con dompdf.
- **Verificación**: render real de los 3 PDFs con datos de la DB — header de marca, alineaciones, backgrounds navy de headers, acentos (á/é/í/ó/ñ), footer fijo y listado landscape multipágina, todo correcto y equivalente a Gotenberg. **Pest 164 verdes** ahora **sin** el container gotenberg (bien para el CI de Fase 7). Pint limpio.
- **ADR-0004**: sección "Revisión Fase 6" (driver dompdf por restricción de hosting; cierra el riesgo que el propio ADR anticipó).

**Breaking**: nada (mismos endpoints, misma salida). **Migración**: `composer install` (suma `dompdf/dompdf`); `LARAVEL_PDF_DRIVER=dompdf` en `.env`; `docker compose up -d` ya no levanta `gotenberg`.

## [2026-06-25] Fusión NZ Fase 5++ — Rediseño visual profundo + SEO — DONE

**Resumen**: Segunda pasada de diseño sobre `apps/public` — rediseño completo del Navbar (floating island pill), mapa, listado y detalle de propiedades, más correcciones SEO críticas para OpenGraph al compartir.

**Cambios**:
- **Navbar**: floating island pill — pill centrada fija con `backdrop-blur`, scroll state `bg-navy/70 → bg-navy/92`, hover links con pill background (no underline), mobile overlay fullscreen con links Fraunces 4xl + stagger + Escape key.
- **PropertiesMap**: navy 2-columnas, mapa custom brand palette (cream/gold/celeste), `APIProvider language="es" region="AR"`, InfoWindow español sin emojis, badge conteo disponibles.
- **PropertiesExplorer**: sticky filter bar con `backdrop-blur`, FilterChip activo en gold, search con focus gold ring, contador de resultados.
- **PropertyCard**: imagen 16/10, gradiente dramático con hover, badge tipo en gold (bottom-left), border-l gold en hover, footer strip "Ver propiedad".
- **Detalle de propiedad**: hero foto-background (60-68vh), overlay gradiente navy, info general como `InfoCard` grid (cards blancas con icono gold + label), servicios chips gold/8, características con check icon en círculo gold, `SectionHeading` con barra gold, sidebar navy.
- **SEO — OpenGraph**: `og:type: 'website'` (era `'article'`), imágenes OG con `width/height/alt`, `twitter.images` con foto real de cada propiedad, `siteName`+`locale` en OG.
- **SEO — Home**: `export const metadata` con `title: { absolute: site.name }` + canonical + OG.
- **Sitemap**: vendidas `priority: 0.3 / changeFrequency: 'yearly'`, disponibles `0.6 / monthly`.
- **Schema**: `openingHoursSpecification` corregido a 2 bloques (mañana 8–12, tarde 16–19).
- **Seeder**: `DatabaseSeeder` usa `Hash::make()` en vez de `bcrypt()` — fix bug double-hash con cast `hashed` + `BCRYPT_ROUNDS=12`.

**Breaking**: nada. **Migración**: nada (solo frontend + seeder).

## [2026-06-23] Fusión NZ Fase 5+ — Pulido visual del sitio público — DONE

**Resumen**: Pasada de diseño/motion sobre `apps/public` para subir el nivel visual (es la cara de la inmobiliaria y página SEO-crítica). **Cero dependencias nuevas** (todo con framer-motion/embla ya instalados), SSG intacto y `prefers-reduced-motion` respetado en cada animación.

**Cambios**:
- **Hero**: el lado derecho (antes vacío) suma una **casa line-art SVG** (`HeroHouse.tsx`) — trazos dorados que se "dibujan" con `pathLength` escalonado, float infinito, **parallax** al scroll y halo; layout 2-columnas en desktop, oculta en mobile. Subrayado de "perfecta" animado y botones con `whileHover`/`whileTap`.
- **Credibilidad**: franja `Stats.tsx` con **contadores animados** (`Counter.tsx`, 0→N al entrar en viewport) — años, propiedades, operaciones cerradas, localidades (derivados del catálogo en build).
- **Cards de propiedad** (`PropertyCard.tsx`): overlay de gradiente que intensifica en hover, badge de categoría que vira a dorado, zoom de imagen. Sigue siendo server component.
- **Galería de detalle** (`ImageCarousel.tsx`): prop opt-in `thumbnails` → **tira de miniaturas sincronizada** (embla thumbs) con hover zoom, activada en `/propiedades/[slug]`. Capua queda con dots intacto.
- **Navegación/UX**: botón **scroll-to-top** (en `FloatingActions`), **barra de progreso** de scroll dorada (`ScrollProgress.tsx`), **preloader** breve de marca N|Z (`Preloader.tsx`), y **transición de página** sutil (`app/template.tsx`).
- **Capua**: **crossfade** automático de las imágenes `transition-*` recuperado del legacy (`CapuaCrossfade.tsx`, fade + ken-burns) y la galería interior pasa de carrusel a **masonry** con lightbox (`MasonryGallery.tsx`, reusable).
- **Verificación**: `lint` + `tsc --noEmit` limpios; Vitest 12 verdes; dev compila `GET / 200` sin errores. (Build export queda para correr con el dev apagado.)

**Diferido (próxima ronda)**: #7 grid/lista + skeletons, #8 testimonios, #9 migración a shadcn, #10 pasada fina responsive/a11y. También descartado el blend `layoutId` cross-página (finicky con `output: export`, bajo payoff).

**Breaking**: nada. **Migración**: nada.

## [2026-06-23] Fusión NZ Fase 5 — Sitio público (Next.js SSG) — DONE

**Resumen**: Nace `apps/public`, el sitio público de venta reconstruido como **Next.js 15 (App Router) con `output: 'export'`** (estático, para Hostinger sin Node). Consume la API pública de ventas de Fase 2; todo el catálogo se trae **en build** y se generan estáticamente home + catálogo + detalle por propiedad + vendidas. Estética editorial premium con la marca NZ (navy/dorado, Poppins + Fraunces) y animaciones framer-motion.

**Cambios**:
- **Backend (mínimo)**: columna `slug` en `sale_properties` (migración nullable+unique con **backfill** `slug(title)-{id}`); el modelo `SaleProperty` la genera internamente en create/update (no fillable → el admin no la manda); `SalePropertyResource` la expone. Rutas admin siguen por `id`. Pest **+5** (159→164).
- **`apps/public`** (Next 15 + Tailwind 4 + framer-motion): páginas SSG `/`, `/propiedades` (filtros por categoría + búsqueda sin tildes, client-side sobre datos embebidos), `/propiedades/[slug]` (`generateStaticParams` + `generateMetadata` OG por propiedad; galería embla + lightbox; servicios/características; mapa sanitizado; WhatsApp prellenado; similares), `/vendidas`, `not-found`. Secciones home: Hero, **Capua completa** (carruseles + amenities + galería interior), About, Categorías (de `property-types`), **mapa interactivo Google Maps con clustering** (`@vis.gl/react-google-maps` + `@googlemaps/markerclusterer`, fallback sin API key), Contacto (mapa estático + WhatsApp/IG). Navbar sticky, Footer, FABs.
- **SEO**: `generateMetadata` por página/propiedad (title/description/canonical/OG/Twitter), JSON-LD `RealEstateAgent` global + `Product` por propiedad, `sitemap.ts` (todas las propiedades) + `robots.ts`. `images.unoptimized` + `trailingSlash`.
- **Seguridad — `map_embed` (stored-XSS)**: `lib/sanitizeMapEmbed` **no** inyecta el HTML del admin; extrae solo el `src`, valida `https` + host `www.google.com` + path `/maps/embed`, y arma **nuestro propio `<iframe>`**. Además se endureció la inyección de **JSON-LD** (`jsonLdString` escapa `<` → `<`) para que un campo con `</script>` no rompa el bloque. Ambos con test. Vitest **12** (sanitizer 10 + jsonLd/whatsapp 2).
- **Infra**: servicio `next-public` en `docker-compose.yml` (puerto directo `${PUBLIC_PORT:-3000}`, **no** por nginx — es otro dominio en prod), `docker/next/Dockerfile`, env nuevas en `.env.example` (`PUBLIC_PORT`, `API_INTERNAL_URL`, `NEXT_PUBLIC_*`), regla `.claude/rules/nextjs-ssg.md`, `.gitignore` (`.next`/`out`), scripts root (`sh:public`/`lint:public`/`build:public`/`test:public`).
- **Verificación**: Pest 164 + Vitest 12 verdes; `tsc`+`lint`+`build` (export con 52 páginas de propiedad + sitemap + robots) verdes; manual en `localhost:3000` (todas las páginas 200, datos reales, imágenes desde `storage`, mapas sanitizados, head SEO correcto). `/security-review`: 1 hallazgo (JSON-LD) **corregido**.

**Breaking**: nada. **Migración**: `php artisan migrate` (agrega `slug` + backfill); `docker compose up -d --build` (levanta `next-public`). El mapa interactivo del home requiere `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (sin ella, fallback). **Diferido a Fase 7**: deploy a Hostinger (rsync de `out/`), dominio/TLS, rebuild-on-publish, redirects `/propiedadN`→slug.

## [2026-06-22] Fusión NZ Fase 4 — Admin de ventas (React) — DONE

**Resumen**: Sección "Propiedades en venta" en el admin React, visible solo para el superadmin, que gestiona propiedades en venta + categorías + fotos (multi-upload + reorder drag-drop) + estado vendida. Consume la API de Fase 2. Sin tocar el backend.

**Cambios**:
- **Gating**: `User` (front) suma `role`/`is_superadmin`; `nav-items` marca el item `superadminOnly` y `SidebarNav` lo filtra; ruta `/propiedades-venta` envuelta en `RequireSuperadmin` (redirige a `/` si no).
- **Feature `sales-properties/`** (espejo de `features/properties`): `types`/`schema`/`api`/`queries` + `queryKeys`; `SalesPropertiesPage` (DataTable orden por defecto `-id` + filtros categoría/vendida/`q` + búsqueda); `SalePropertyFormDialog` (campos + multi-upload de fotos con preview/borrar); `SalePropertyGalleryDialog` (visor/lightbox: clic en la miniatura → todas las fotos con anterior/siguiente + tira de miniaturas + contador); `PropertyTypesDialog` (ABM de categorías, toast 409 si en uso); `columns` con badge Vendida y contador de fotos en la portada.
- **Drag-drop**: `@atlaskit/pragmatic-drag-and-drop` para **reordenar fotos** (`DraggableImageGrid` + util puro `reorder`, persiste vía `PATCH /sale-property-images/reorder`).
- Tests: **Vitest 52** (SidebarNav gating, SalesPropertiesPage lista/crea/filtra/borra/categorías, `reorder` util). Lint + typecheck + build OK. `/security-review` sin hallazgos.

- **Notificaciones (cross-cutting)**: se reemplazó **sonner por Sileo** (`sileo`) en toda la app. Adapter `@/lib/toast.ts` con la misma firma (`toast.success('texto')`) → no se reescribieron call sites; `@/components/ui/toaster.tsx` monta el `<Toaster>` de Sileo (top-right). `sonner` desinstalado.

**Diferido**: reorder drag-drop de las **filas de la tabla** (requiere modificar el `DataTable` compartido y arrastrar entre páginas paginadas es mala UX).

**Nota para Fase 5**: `map_embed` (iframe de Maps) se guarda como texto; al renderizarlo en el sitio público **sanitizar/whitelistear** para evitar stored-XSS.

**Breaking**: nada. **Migración**: nada (solo frontend; suma la dep `@atlaskit/pragmatic-drag-and-drop`).

## [2026-06-19] Fusión NZ Fase 3 — Auth + roles — DONE

**Resumen**: Roles de usuario para que solo el superadmin (Giuliano) gestione ventas; el staff inmobiliaria (incl. la dueña) sigue solo en alquileres. Backend-only (la UI oculta la sección ventas en Fase 4).

**Cambios**:
- **Schema**: tabla `roles` (`name` unique, `label`) + `users.role_id` (FK nullable, `nullOnDelete`). Un rol por usuario. Se **descartó** `spatie/laravel-permission` (overkill para 2 roles) y la columna string suelta.
- **Modelos**: `Role` (consts `SUPERADMIN`/`INMOBILIARIA`, `hasMany users`); `User` suma relación `role()`, helper `isSuperadmin()` (null-safe → least privilege) y `role_id` a `$fillable`.
- **Autorización**: Gate `manage-sales` (= `isSuperadmin()`) en `AppServiceProvider`; las rutas de **escritura** de ventas (property-types + sale-properties + imágenes + reorder) van en un grupo `can:manage-sales` → `inmobiliaria` recibe **403**. Lecturas públicas y endpoints de alquileres **sin cambios**.
- **API**: `UserResource` expone `role` + `is_superadmin` (para gatear la UI en Fase 4).
- **Seeder**: `RoleSeeder` (llamado siempre, también prod) crea los 2 roles, asigna `ggiuliano526@gmail.com`→superadmin (hardcodeado) y el resto→inmobiliaria.
- Tests: **Pest 158** (modelo/relación, seeder, autorización 403/200, `/me` con rol; tests de ventas de Fase 2 actualizados a actuar como superadmin). Pint limpio. `/security-review` sin hallazgos.
- **Verificación real**: seed sobre la DB → Giuliano superadmin, Demo inmobiliaria; lectura pública de ventas sigue 200.

**Breaking**: las escrituras de ventas ahora requieren rol superadmin (antes cualquier autenticado). **Migración**: 2 migraciones (`roles`, `users.role_id`) + `php artisan db:seed --class=RoleSeeder`.

## [2026-06-19] Fusión NZ Fase 2 — Dominio ventas en Laravel — DONE

**Resumen**: El dominio "ventas" (propiedades en venta, categorías, imágenes) del sitio `nz-estudio` vive ahora en el backend Laravel único: 3 tablas + API REST + comando de migración. Sin frontend (admin React = Fase 4; sitio público Next = Fase 5).

**Cambios**:
- **Tablas/modelos** (inglés/snake_case, ADR-0002): `property_types`, `sale_properties`, `property_images` con migraciones, modelos Eloquent (relaciones + casts) y factories.
- **API REST** (`/api/v1`): lectura **pública** (`GET sale-properties` con filtros `type`/`sold`/`q` + sort + paginación vía spatie/query-builder, `GET sale-properties/{id}`, `GET property-types`) para el SSG; **CRUD admin** (`auth:sanctum`) de propiedades y categorías (409 en categoría con propiedades).
- **Imágenes**: multi-upload validado por **mime real** → WebP (reusa el pipeline de `PropertyPhotoController`, Intervention GD q82) a `storage/app/public/sale-properties/{id}/`; borrar + reorder de fotos y de propiedades.
- **Migración**: comando idempotente `php artisan ventas:import` (conexión secundaria `nzestudio`) — copia categorías/propiedades/imágenes del dump, convierte WebP, avisa faltantes sin abortar.
- **Doc**: Scramble autogenera los 8 endpoints en `/docs/api`.
- Tests: **Pest 151** (17 nuevos: modelos, property-types, sale-properties, imágenes/reorder, comando). Pint limpio. `/security-review` sin hallazgos.
- **Verificación real**: import del dump (7 tipos, 51 propiedades, 68 imágenes, 0 faltantes); API pública e imágenes sirviendo por HTTP 200.

**Breaking**: nada. **Migración**: 3 migraciones nuevas (`php artisan migrate`). El dump `nzestudio.sql` y los uploads se cargan localmente fuera de git.

## [2026-06-19] Fusión NZ Fase 1 — Consolidación repo + docs — DONE

**Resumen**: Arranca el track **Fusión NZ** (7 fases) que integra el sitio público de venta `nz-estudio` (PHP vanilla) al monorepo. Esta fase es solo de consolidación documental + traer el código de referencia; **no migra código de negocio**.

**Cambios**:
- **Spec paraguas** `docs/superpowers/specs/2026-06-19-fusion-nz-design.md` (arquitectura destino `apps/api`+`apps/web`+`apps/public`, 7 fases, convenciones, decisiones confirmadas).
- **ADR-0009** `docs/adr/0009-fusion-nz-monorepo.md`: estructura monorepo, `.env` único = patrón existente, merge = copia como referencia, dump local fuera de git, 2 roles (`superadmin`/`inmobiliaria`).
- **Roadmap**: nuevo bloque "Track Fusión NZ" (fases 1–7); **sub-H absorbida** por la Fase 7; bitácora 2026-06-19.
- **Referencia traída**: `legacy-nz-estudio/` (copia de nz-estudio, 3.7 MB) **sin** `.env`, `uploads/`, `*.sql`, `db/`, ni tooling de agente. Se conservan `.github/`+`docker/` como insumo de deploy (Fase 7).
- **`.gitignore`** endurecido (defensa en profundidad sobre `legacy-nz-estudio/`). **CLAUDE.md** con punteros al track y a la carpeta de referencia.

**Decisiones confirmadas (2026-06-19)**: merge por copia · `nz-administracion.net` hoy = legacy PHP · 2 roles sin rol especial dueña · dump local.

**Breaking**: nada. **Migración**: nada (sin cambios de código ni schema).

## [2026-06-18] sub-J — Ajustes UX recibos + historial — DONE

**Resumen**: Tras feedback de la dueña sobre el branch de sub-J, cinco ajustes de UX/datos en Recibos, su detalle, los paneles del pie y el historial de WhatsApp. No tocan la lógica de envío ni el canal.

**Cambios**:
- **Tooltip "enviado"** en la fila de Recibos: usaba `formatDate` sobre un datetime ISO (salía `18T21:00:25+00:00/06/2026`) → ahora `formatDateTime` (`DD/MM/YYYY HH:mm`).
- **Acciones consolidadas**: los íconos Recibo (FileText) y Rendición (FileSpreadsheet) ahora abren un menú con **Ver / descargar** + **Enviar** (al inquilino / al dueño). Se sacaron las dos entradas de envío del menú `⋯`, que queda solo con Editar/Eliminar. Mismo menú en el modal de detalle (`ReceiptDetailDialog` recibe `onSendWhatsApp`).
- **Selector de mes/año** en los paneles del pie de Recibos (pendientes + hechos), default mes/año actual. `DashboardController` acepta `month`/`year` opcionales (valida `month` contra `MONTHS`, `year` entero 2000–2100) y construye `DashboardData($month,$year)`; `useDashboard`/`getDashboard` aceptan params y la query key los incluye.
- **Historial**: el envío de recibo/rendición (sub-I) guardaba el `body` como `"Recibo #N (PDF)"`; ahora guarda el **texto real** del mensaje (espejo de las plantillas Meta `envio_recibo`/`envio_rendicion`, con nombre/mes/año rellenados).
- Tests: Pest **134** (dashboard month/year + mes inválido 422, body real en `ReceiptWhatsAppTest`), Vitest **43** (menú Ver/Enviar en fila y detalle). lint + Pint limpios. `/security-review` sin hallazgos.

**Breaking**: nada. **Migración**: nada (sin cambios de schema).

## [2026-06-17] sub-J — Centro de mensajes WhatsApp (manual) — DONE (código + tests)

**Resumen**: Mensajes **manuales** que la dueña dispara con botones, siempre con **selección + preview + confirmación** y **progreso en vivo + historial**. Dos tipos: **recordatorio de pago masivo** (elige inquilinos, escribe la fecha límite, mes automático) y **recordatorio de faltantes** (por inquilino, compone qué le falta). Reusa el canal de sub-I. (Se descartó el enfoque automático por cron que se había prototipado.) **Pendiente**: aprobar 2 plantillas de texto en Meta.

**Cambios**:
- **`whatsapp_messages` generalizada** (historial unificado): `receipt_id` nullable + `batch_id`, `contract_id`, `recipient_name`, `body`, `template`, `template_vars`, y `type` a 30 chars. sub-I ahora también guarda `recipient_name`/`body` ("Recibo #N (PDF)").
- **`WhatsAppClient::sendTemplate()`**: plantilla de **solo texto** (sin header de documento).
- **`App\Support\WhatsAppSender::send()`**: envía una fila por su plantilla+vars y la marca sent/failed. **Job `SendBulkReminder`** (`afterResponse`): procesa las filas `queued` de un lote una por una (un fallo no corta el lote).
- **Endpoints** (`auth:sanctum` + throttle): `POST /whatsapp/payment-reminders` (crea lote → 202 `{batch_id,total,skipped}`), `POST /whatsapp/missing-items` (envío inmediato, 422 si tel inválido), `GET /whatsapp/messages` (historial), `GET /whatsapp/batches/{id}` (estado del lote para el progreso), `POST /whatsapp/batches/{id}/retry` (reenvía solo los fallidos en un lote nuevo).
- **Frontend `/recordatorios`** (feature `whatsapp/`, nav nuevo): 3 pestañas. **Pago** (fecha límite + checklist de inquilinos + preview + confirmación + **`BatchProgress`** que poll-ea el lote y muestra ✓/✗ por destinatario, contadores y **reintentar fallidos**). **Faltantes** (`MissingItemsDialog`: acción + conceptos → texto editable + preview). **Historial** (tabla unificada). `ui/switch` se eliminó (sin uso).
- Config/env: `WHATSAPP_TEMPLATE_RECORDATORIO_PAGO`, `WHATSAPP_TEMPLATE_RECORDATORIO_FALTANTE`.
- Tests: Pest **136** (PaymentReminders 202/skip/validación/401, MissingItems 202/422, WhatsAppMessages historial+batch+retry, SendBulkReminder, sendTemplate). Vitest **42** (RemindersPage: progreso de pago, faltantes, historial). tsc/lint verdes.

**Breaking**: nada. **Migración**: `php artisan migrate` (altera `whatsapp_messages`) + variables `WHATSAPP_TEMPLATE_*` en `.env`.

## [2026-06-17] sub-I — Envío por WhatsApp — DONE (código + tests)

**Resumen**: Recibos (al inquilino) y rendiciones (al dueño) se envían por **WhatsApp Cloud API oficial** (Meta, ADR-0008) desde la tabla de Recibos, adjuntando el PDF de sub-F. Antes: descargar y reenviar a mano. Envío encolado, con normalización de teléfono a E.164, log de envíos y marca "enviado" en la fila. **Pendiente**: aprobar las 2 plantillas en Meta + verificación de envío real con número de prueba (lo hace el usuario; el canal ya se validó manualmente con `hello_world`).

**Cambios**:
- **`App\Services\WhatsAppClient`**: `uploadMedia()` (sube el PDF, devuelve `media_id`) + `sendTemplateDocument()` (mensaje de plantilla con documento en el header). Config en `config/services.php` (`whatsapp.*`), secretos en `.env` (claves vacías en `.env.example`). El token nunca se loguea.
- **`App\Support\ReceiptPdf`** (refactor DRY): centraliza la construcción de los PDFs de recibo/rendición (antes inline en `ReceiptPdfController`); ahora la consumen el controller (`->inline`) y el job (`->save`). `filename()` evita duplicar el nombre.
- **`App\Support\PhoneNumber::toE164()`**: normaliza tels legacy (`Tel_Dueno`/`Tel_Inquilino`) a E.164 con `propaganistas/laravel-phone`; null si inválido. Caveat AR del "9" de celular documentado (a confirmar contra Meta).
- **Job `SendWhatsAppDocument`** (`ShouldQueue`, 3 reintentos): genera el PDF a tmp, sube media, manda plantilla, marca el mensaje `sent`/`failed`. Cola `sync` por ahora (sin worker); prod (sub-H) → `database` + `queue:work`.
- **Tabla + modelo `whatsapp_messages`** (snake_case inglés): tipo, destinatario, recibo, `meta_message_id`, estado, error, `sent_at`, usuario. FK a `recibo`/`users`.
- **Endpoint** `POST /api/v1/receipts/{receipt}/whatsapp` (`auth:sanctum` + `throttle:30,1`): `SendWhatsAppRequest` valida `type` (recibo/rendicion) y `phone` override; el controller resuelve el destinatario (inquilino/dueño), normaliza, **422** si el tel es inválido, encola y devuelve **202** + `WhatsAppMessageResource`.
- **`ReceiptResource`** expone `whatsapp_recibo_sent_at` / `whatsapp_rendicion_sent_at` (último envío exitoso por tipo, vía `withMax` en el index, sin N+1).
- **Frontend `features/receipts/`**: 2 acciones en el dropdown de la fila (enviar recibo / rendición) → `SendWhatsAppDialog` (destinatario + teléfono prellenado **editable** + preview del texto + nombre del PDF), mutation react-query que invalida la lista, toasts. Marca verde "enviado el DD/MM" en la fila (tooltip con fechas por tipo).
- Tests: Pest **104→122** (`WhatsAppClient` con `Http::fake`, job sent/failed, endpoint 202/422/401, `PhoneNumber` AR ok/inválido). Vitest **37→39** (`SendWhatsAppDialog`: prellenado, preview, envío, dueño en rendición). tsc/lint verdes.

**Breaking**: nada. **Migración**: `php artisan migrate` (tabla `whatsapp_messages`) + `composer require propaganistas/laravel-phone` + variables `WHATSAPP_*` en `.env`.

## [2026-06-16] sub-G — Dashboard / Inicio — DONE

**Resumen**: Nueva pantalla de **Inicio** (`/`, landing post-login) con visión operativa de un vistazo — algo que el legacy nunca tuvo. Tres bloques accionables, **sin métricas de ingresos** (decisión del usuario): totales del sistema, recibos pendientes del mes y contratos por vencer (90 días). Un único endpoint agregado + una página linda (skill `frontend-design`) cohesiva con el tema navy/dorado NZ.

**Cambios**:
- **Backend — un endpoint agregado** `GET /api/v1/dashboard` bajo `auth:sanctum` + `NoStoreHeaders` (devuelve PII → `Cache-Control: no-store`). Sin parámetros: deriva mes/año de `now()`.
- **`App\Support\DashboardData`** (testeable sin HTTP, estilo `MonthlyPaymentsReport`): `totals()`, `expiringContracts(90)`, `pendingReceipts()`. Reusa el patrón `whereDoesntHave` de `MonthlyPaymentsReport::unpaid()` agregando filtro de contrato activo. Mes actual vía `StoreReceiptRequest::MONTHS[now->month-1]`.
- **`Contract::scopeActive`** — vigencia `F_Inicio <= hoy <= F_Fin` (tolera `F_Fin` null como activo). Reusado en totales y pendientes. Queries 100% parametrizadas (sin input de usuario).
- **`DashboardResource`** → `{ totals, pending_receipts: ContractResource[], expiring_contracts: [{days_left, contract}] }`.
- **Frontend `features/dashboard/`**: `DashboardPage` + `StatCards` + `PendingReceiptsCard` + `ExpiringContractsCard`. Stat cards con hairline dorado y stagger de entrada; tabla de pendientes con acción **"Crear recibo"** por fila; tabla de por-vencer con badge de urgencia (rojo <30d, ámbar <60d). Empty states con check verde. Listas cortas → tabla simple (no DataTable).
- **"Crear recibo" desde un pendiente**: navega a `/recibos` con `location.state`; `ReceiptsPage` lo consume al montar y abre `ReceiptFormDialog` con el contrato preseleccionado (prop opcional `defaultContract`, reusa `EntityCombobox`).
- **Routing/nav**: `/` ahora renderiza el Dashboard (antes redirigía a `/ciudades`); catch-all `*` → `/`; nuevo nav item "Inicio" (`LayoutDashboard`) al tope; el login post-sesión redirige al Dashboard.
- **Sidebar colapsable** (pedido del usuario): botón en el header (desktop) que colapsa/expande el sidebar con **transición de ancho** (64→0, `motion-reduce` respetado), estado persistido en `localStorage`.
- **Ampliación (2ª ronda)** — más densidad operativa, todo reusando lo existente:
  - **Accesos rápidos** en el inicio: cards a Nuevo recibo / Nuevo contrato / Nueva propiedad (navegan abriendo el form de alta vía `location.state.openCreate`, hook `useOpenCreateFromState`) + Reporte mensual PDF (reusa `openMonthlyReport`).
  - **Progreso del mes**: barra "X de Y contratos activos ya con recibo" (derivada del payload, sin backend).
  - **Últimos recibos generados** + **Contratos con saldo pendiente** (deuda, `Saldo > 0`): `DashboardData::latestReceipts()` y `contractsWithBalance()` → 2 llaves nuevas en `DashboardResource`.
  - **Página de Recibos** suma al pie: panel **"por hacer este mes"** (reusa `PendingReceiptsCard` + `useDashboard`, crea el recibo in-place) + panel **"hechos este mes"** (`MonthlyReceiptsCard`, reusa `GET /receipts` filtrado al mes). Total de recibo extraído a `receiptTotal` (`features/receipts/total.ts`), reusado por el detalle.
- Tests: Pest **97→104** (`DashboardData` totales/ventana-90d/pendientes/últimos/saldo + endpoint 401/200/shape). Vitest **34→37** (`DashboardPage`: cards, accesos rápidos, progreso, últimos recibos, saldos, empty states; `ReceiptsPage`: paneles del mes; login redirige al inicio). `/security-review` del branch **sin hallazgos**. tsc/lint/build verdes.

**Breaking**: nada. **Migración**: nada (solo código; sin migraciones ni deps nuevas).

## [2026-06-16] sub-F — PDFs (recibo, rendición, listado mensual) — DONE

**Resumen**: Generación de los 3 documentos del legacy de recibos en la stack nueva (Laravel + React), con réplica fiel + pulido visual y branding NZ. Motor: spatie/laravel-pdf v2 sobre Gotenberg (Chromium en container aparte). Los 3 PDFs verificados end-to-end con render real.

**Cambios**:
- **Infra**: nuevo servicio `gotenberg` (`gotenberg/gotenberg:8`) en `docker-compose.yml` (red `appnet`, sin puerto público). `.env`: `LARAVEL_PDF_DRIVER=gotenberg`, `GOTENBERG_URL=http://gotenberg:3000`. Config publicada en `config/laravel-pdf.php`. ADR-0004 (aceptada).
- **Deps**: `spatie/laravel-pdf` 2.12 + `luecano/numero-a-letras` 4.1 (reemplaza el conversor número→letras buggy del legacy: "docientos"/"trecientos").
- **3 endpoints GET** bajo `auth:sanctum` + `NoStoreHeaders`, devuelven PDF inline: `/receipts/{receipt}/pdf` (recibo), `/receipts/{receipt}/settlement` (rendición), `/reports/monthly-payments?month=&year=` (listado mensual, landscape).
- **Blades** en `resources/views/pdf/` (layout + partials brand-header/signature + receipt/settlement/monthly-payments). Logo y firma embebidos como **data URI base64** (`App\Support\PdfAsset`), assets en `resources/pdf-assets/`. Datos fijos de la inmobiliaria + `commission_rate` (10%) en `config/inmobiliaria.php`.
- **Cálculos** centralizados en `App\Support\ReceiptCalculator` (total recibo, comisión, entrega rendición, entrega mensual) y filtrado del reporte en `App\Support\MonthlyPaymentsReport` (query **parametrizada** — corrige la SQL injection del legacy `pagos.php`).
- **Frontend**: botones-ícono **inline** en la fila de Recibos (Detalle / Recibo / Rendición con tooltip) + control mes/año/"Generar PDF" en el toolbar; los PDF abren en **pestaña nueva** (`window.open`, cookie Sanctum).
- **Modal de detalle** (`ReceiptDetailDialog`): cabecera navy con total en dorado, datos de contrato/pago, desglose separando los cargos que suman al recibo de los conceptos que van a la rendición (arreglos/otros), comentarios y accesos a los PDF. Estética coherente con el admin NZ.
- **Tablas — scroll horizontal solo cuando hace falta**: se quitó el `whitespace-nowrap` de las celdas del `Table` compartido (a ancho normal las tablas entran sin barra); se mantiene `overflow-x-auto` para que aparezca la barra al hacer zoom/pantalla angosta, sin recortar contenido.
- **Montos en 0 no se muestran**: el modal y los PDF (recibo/rendición) omiten la fila; la tabla de recibos y la grilla del listado mensual muestran "—". Menos ruido visual.
- **Modal de detalle**: además de los PDF, botones **Editar** y **Eliminar** (con doble confirmación vía `ConfirmDialog`).
- **PDF**: pie de página fijo en recibo y rendición (datos de la inmobiliaria); fuente general más grande para mejor legibilidad; en el recibo el bloque de contrato/concepto/dueño va alineado a la derecha (espejo del legacy).
- **Inputs numéricos**: los campos en 0 se muestran vacíos (placeholder) en vez de un "0" pegado — evita el "0500" al editar. Aplica a recibos (montos/año) y al saldo de contratos.
- **Config**: datos de la inmobiliaria como `NZ_*` en `.env(.example)` (defaults en `config/inmobiliaria.php`). Nombre real: **Nadina Zaranich**.
- **Legacy (para comparación)**: el contenedor `legacy` ahora conecta a la DB del compose (`LEGACY_DB_*` → servicio `mariadb`/`inmobiliaria`, env-driven en `conexion.php`); y se corrigió la URL de las imágenes en los PDF del legacy (`/proyectos-php/inmobiliaria-nz/assets/` → `/assets/`) para que cargue logo y firma.
- Tests: Pest **83→97** (+14: unit de cálculos + número→letras; feature de los 3 endpoints con render real %PDF, 401/404/422). Vitest **30→34** (`window.open` en los 3 botones + modal de detalle). Verificación manual: los 3 PDFs generados con datos reales, layout/datos/cálculos correctos; legacy comparado lado a lado.

**Breaking**: nada. **Migración**: `docker compose up -d --build` (levanta el nuevo servicio `gotenberg` y recrea `legacy` con su DB); `composer install` en php-fpm (deps nuevas).

## [2026-06-15] sub-E — Frontend React core (CRUD de los 7 recursos) — DONE

**Resumen**: Sobre el patrón de Ciudades se completó el CRUD de los 6 recursos restantes en `fase/E-frontend`, cerrando el frontend core. Todo el dominio (Ciudades, Formas de pago, Dueños, Inquilinos, Propiedades, Contratos, Recibos) ya tiene su slice React. La generación de PDFs (recibo individual, rendición y listado mensual) queda explícitamente diferida a **sub-F**.

**Hecho**:
- **Formas de pago, Dueños, Inquilinos, Propiedades (con foto), Contratos, Recibos** — cada uno como módulo `features/<x>/` (types, api, queries, schema, columns, Page, FormDialog) espejo de `features/cities/`.
- **`EntityCombobox`** (`components/form/`): selector FK con búsqueda server-side (`?q`), `clearable` opcional. Usado para ciudad (dueños/inquilinos/propiedades), dueño/inquilino/propiedad (contratos) y contrato/forma de pago (recibos). shadcn `command`+`popover`.
- **Foto de propiedad**: upload/preview/borrado (`POST/DELETE /properties/{id}/photo`); el guardado de datos no se bloquea si falla la foto.
- **`ConfirmDialog`**: doble confirmación ("¿Estás seguro?") en todos los borrados.
- **Paginación** (en `DataTablePagination`): default **10**, selector 10/20/30/50.
- **Orden "más recientes primero"**: `defaultSort(-id)` en owners/tenants/properties/payment-methods (api) + tablas sin sort inicial. Ciudades por nombre; recibos por `-number`.
- **Contratos**: filtros por certificación, dueño, inquilino y rango de fecha de inicio (`start_from`/`start_to`, nuevos callbacks en `ContractController`). Toolbar con search opcional + popover de filtros.
- **Recibos** (`features/receipts/`): es **hoja** → borrado directo (sin 409). Form con contrato + forma de pago (comboboxes), fecha de pago, los 8 montos, mes (Enero..Diciembre) / año, comentarios; validación espejo de `StoreReceiptRequest`. Filtros por contrato + forma de pago + mes + año. Tabla con paridad legacy: **Nº · Contrato (Dueño - Inquilino) · FP · Fecha · Pago · Mes · Año · Mun. · Agua · Electr. · Gas · Arreglo · Otros · Honor.** Combobox de contrato muestra `Dueño - Inquilino` (espejo del `CONCAT` legacy). Nuevo `Textarea` (shadcn) para comentarios y `fetchPaymentMethodOptions`.
- **Identidad**: login split-brand navy, primary `#13294b`, dorado `--nz-gold`, favicon, crédito "Desarrollado por Giuliano Gerlo" (`MadeByGerlo`) en sidebar/login.
- Tests Vitest+MSW por recurso. Suite web **30 verde**; pest **sin romper** (controllers tocados verdes).

**Diferido a sub-F (PDFs)**: el legacy de recibos incluye "Generar PDF" mensual (`pagos.php`), PDF de recibo individual (`generar-recibo.php`) y PDF de rendición (`generar-rendicion.php`). Esas 3 funcionalidades son generación de documentos desde Laravel = entregable de sub-F; no se pierden, se hacen en esa fase.

**Breaking**: nada. **Migración**: `pnpm install` (deps nuevas) — automático en `docker compose up` del container `node-dev`.

## [2026-06-12] sub-E — Frontend React core (fundación + slice Ciudades)

**Resumen**: Fundación de la SPA con identidad NZ y un vertical slice CRUD completo de Ciudades como patrón replicable. La SPA pasó de scaffold (health-check) a app real: login Sanctum, layout navy, tablas server-side y modales. Los otros 6 recursos quedan para sub-fases E2+.

**Cambios**:
- Tooling: Tailwind CSS 4 (`@tailwindcss/vite`, config CSS-first con tokens NZ en `@theme`), shadcn/ui (new-york, 18 componentes base), react-hook-form + zod, `@tanstack/react-table`, alias `@/*`. Poppins por `<link>`.
- ESLint flat config real: `typescript-eslint` + `react-hooks` + `jsx-a11y` + `react-refresh` (la de sub-A no parseaba TS). Vitest 2 → 3 (vitest 2 fija vite 5 y choca con vite 6).
- Auth Sanctum cookie: `lib/api.ts` (axios `withCredentials`+`withXSRFToken`, interceptor 401), `lib/csrf.ts` (`ensureCsrf`), `useAuth`/`useLogin`/`useLogout` (React Query), `RequireAuth` guard, `LoginPage` (RHF+zod, 422→campos, 429→toast, logo NZ).
- Layout: `AppLayout` (sidebar navy `#05172D` desktop + drawer mobile), `SidebarNav` (7 secciones, solo Ciudades activa, resto "Próximamente"), `UserMenu` (logout).
- DataTable genérico server-side (`@tanstack/react-table` manual sort/pagination) + `DataTablePagination` (meta Laravel) + `DataTableToolbar` (search debounce 300ms) + `DataTableColumnHeader` + `ConfirmDialog`.
- Slice Ciudades (`features/cities/`): api, queries (React Query + `keepPreviousData`), schema zod, columns, `CitiesPage`, `CityFormDialog`. CRUD end-to-end; borrado maneja **409** (FK RESTRICT) mostrando el mensaje del backend.
- Router (`createBrowserRouter`): `/login` pública + zona privada bajo `RequireAuth` → `AppLayout` → `/ciudades`. 401 global → vuelve a login.
- Identidad: `LoginPage` rediseñado split-brand (panel navy con logo/marca + detalle dorado, form a la derecha; colapsa a card en mobile). Primary = navy de marca `#13294b` (reemplaza el azul tipo Bootstrap); acento activo del sidebar en dorado `#c5a572` (token `--nz-gold`).
- Provincia (alta/edición de ciudad) = `Select` con las 24 jurisdicciones argentinas (`provinces.ts`), no texto libre; incluye el valor legacy si cae fuera de la lista.
- Tests: Vitest 3 + Testing Library + MSW (handlers con store en memoria). **9 passed** (LoginPage ok/422/429, DataTable render/paginación, Ciudades lista/crear/409). Reemplazado el test de health de sub-A.
- Verificación: `tsc -b`, `pnpm lint`, `pnpm build` y `pnpm test` verdes. SPA sirve por nginx :8080; CSRF y stateful (`localhost:8080`) ya configurados en sub-C.

**Breaking**: nada — solo frontend. La API no cambió.
**Migración**: `pnpm install` (deps nuevas) — automático en `docker compose up` del container `node-dev`.

## [2026-06-10] sub-D — API REST CRUD

**Resumen**: API REST completa de los 7 recursos del dominio (ciudades, dueños, inquilinos, propiedades, contratos, recibos, formas de pago) sobre los modelos de sub-B, protegida con la auth Sanctum de sub-C. Incluye upload de foto de propiedad a disco en WebP y documentación OpenAPI autogenerada.

**Cambios**:
- 7 controllers `apiResource` (index/store/show/update/destroy) bajo `auth:sanctum` + `NoStoreHeaders`, prefix `/api/v1`.
- Filtros/orden/includes con `spatie/laravel-query-builder` (whitelist por recurso) + búsqueda `?q=` + paginación con tope 100.
- FormRequests Store/Update por entidad (validación espejo del schema legacy, mensajes en español vía `lang/es/validation.php`).
- API Resources con campos en inglés (capa de traducción, ADR-0002).
- Borrado: 409 Conflict cuando una FK RESTRICT lo impide (trait `HandlesRestrictedDelete`); mensaje específico por recurso. Recibos borran directo (son hoja).
- Trait `MapsLegacyFields` (input inglés → columnas legacy) + helper de paginación.
- Foto de propiedad: `POST/DELETE /properties/{id}/photo`. Conversión a WebP (Intervention Image v3 + GD con `--with-webp`), guardada en `storage/app/public/propiedades/{id}/foto.webp`, columna nueva `foto_path`. Validación de mime real (finfo) + máx 5 MB. Borrar propiedad limpia su carpeta.
- `dedoc/scramble`: OpenAPI en `/docs/api` (solo local). nginx: locations `/storage/` (alias al disk public) y `/docs/`.
- Imagen php-fpm: `libwebp-dev` + gd `--with-webp`. Entrypoint: `chmod ugo+rwX storage bootstrap/cache` (workers fpm = www-data sobre bind mount).
- 54 tests Pest nuevos (CRUD + filtros + 409 + foto webp verificada por magic bytes) → suite total **83 passed (301 assertions)**.
- ADR-0006 (scramble) y ADR-0007 (foto file storage). Security review: sin hallazgos.

**Breaking**: nada — `foto_path` es columna aditiva nullable; el legacy sigue insertando sin listarla.
**Migración**: `artisan migrate` agrega `foto_path` a `propiedad`. En deploy (sub-H) contemplar persistencia de `storage/app/public`.

## [2026-06-09] sub-C — Auth moderna (Sanctum SPA)

**Resumen**: Auth cookie-based para la SPA con Sanctum stateful, rate limit en login, perfil de usuario y migración transparente de credenciales MD5 legacy a bcrypt en el primer login. El legacy sigue funcionando: `Pass_User` no se toca.

**Cambios**:
- `statefulApi()` + sesiones en DB (`SESSION_DRIVER=database`), cookies `HttpOnly`/`SameSite=Lax`, CSRF vía `/sanctum/csrf-cookie` (nueva location en nginx).
- Endpoints: `POST /api/v1/auth/login` (rate limit 5/min por email+IP, remember me), `POST /api/v1/auth/logout`, `GET/PATCH /api/v1/me`, `PUT /api/v1/me/password` (requiere password actual; invalida las demás sesiones).
- Rehash transitorio MD5→bcrypt en `AuthController::attemptLegacyMd5()` — borrar al deprecar el legacy.
- Form Requests con mensajes en español + `UserResource` (id/name/email).
- Middleware `NoStoreHeaders` (`Cache-Control: no-store` + `nosniff`) en endpoints autenticados.
- Factory state `legacyMd5()` para tests del flujo de migración.
- Suite Pest: 29 passed (18 nuevos de auth). Security review: sin hallazgos.

**Breaking**: nada — el login legacy sigue usando `Pass_User`.
**Migración**: nada. El usuario MD5 existente migra solo en su primer login al sistema nuevo.

## [2026-06-09] sub-B — Schema + Migrations Laravel

**Resumen**: Capa de datos Laravel sobre la DB legacy compartida. Migrations espejo del schema (baseline skip si la tabla existe), FKs RESTRICT verificables con `legacy:check-orphans`, 8 modelos Eloquent en inglés, factories sin PII y tests contra MariaDB real.

**Cambios**:
- 12 migrations: 7 tablas dominio espejo exacto + users híbrida (legacy + password bcrypt nullable) + FKs/índices idempotentes.
- Comando `php artisan legacy:check-orphans` (gate de la migration de FKs sobre datos viejos).
- Modelos: City, Owner, Tenant, Property, Contract, PaymentMethod, Receipt, User — `$table` legacy, relationships completas, `$timestamps=false`.
- Factories es_AR + `DemoSeeder` (solo local). Cero PII.
- Test DB `inmobiliaria_test` (mismo container, se crea en primer boot del volumen).
- `phpunit.xml` apunta a MariaDB real (paridad de motor).
- Suite Pest: 11 passed.
- ADR-0002: preservar nombres legacy; modelos en inglés como capa de traducción.

**Breaking**: nada — el legacy sigue funcionando igual (mismas tablas).
**Migración**: en DB con dump real: `artisan migrate` → `artisan legacy:check-orphans` → corregir huérfanos si los hay.

## [2026-06-08] sub-A — Infra + Bootstrap (Docker zero-touch)

**Resumen**: Stack nuevo en Docker funcionando con un solo comando. Laravel 13 + React 19 + MariaDB 11.8 + nginx + phpMyAdmin + legacy PHP conviviendo. Tests Pest y Vitest verdes. Legacy preservado en `legacy/` corre en paralelo durante toda la transición.

**Cambios**:
- Monorepo: legacy movido a `legacy/` (368 archivos renombrados, historial preservado vía rename detection).
- `apps/api`: Laravel 13.8 con Sanctum, Pest 4, Pint. Endpoint `/api/v1/health` + test Pest.
- `apps/web`: React 19 + Vite 6 + TS strict. Page que fetcha `/api/v1/health` + test Vitest.
- `docker/`: Dockerfiles para nginx, php-fpm 8.4-alpine, node 22-alpine + pnpm, legacy php 7.4-apache.
- `docker-compose.yml`: 6 servicios + volúmenes nombrados (`mariadb-data`, `api-vendor`, `web-node-modules`) + healthcheck MariaDB + auto-import opcional vía `DB_DUMP_PATH`.
- `.env.example` raíz + `.env` local (gitignored).
- Nginx proxy unificado en `http://localhost:8080` (`/` → Vite con HMR, `/api` → Laravel).
- `package.json` raíz con scripts wrappers de `docker compose` (no requiere Node en host).
- `README.md` con setup 4 pasos.
- ADR-0001 (Laravel API-only vs Inertia → API-only).
- ADR-0005 (PHP 8.4 fijo, upgrade 8.5 diferido).

**Breaking**:
- El legacy ya no se sirve desde la raíz del repo; ahora está en `legacy/`. Producción no se vio afectada (sigue corriendo en Hostinger).

**Migración**:
- Si hacés `git pull` y tenías checkout local en uso, el código PHP legacy se movió a `legacy/`. Ningún PHP en raíz.
- Setup en PC nueva: `docker compose up -d --build` y nada más — el entrypoint de php-fpm auto-crea `.env` y `APP_KEY`.

---

## [2026-06-08] sub-0 — Bootstrap de documentación y reglas

**Resumen**: Se establece la estructura de docs + reglas (`.claude/`) y el roadmap maestro de reformulación. No hay cambios de código todavía.

**Cambios**:
- `CLAUDE.md` raíz reescrito como índice corto.
- `.claude/rules/` con stack, code-style, security, git-workflow, testing, api-conventions, docs-workflow, codegraph.
- `.claude/commands/` con `fase-start`, `fase-close`, `sync-plan`.
- `docs/` con README, roadmap, architecture, changelog.
- `docs/adr/0000-template.md` agregado como plantilla.
- `docs/legacy/snapshot-php.md` con foto del estado actual.

**Breaking**: nada.
**Migración**: nada.
