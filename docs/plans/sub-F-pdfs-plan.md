# Plan — Sub-F: PDFs (recibo, rendición, listado mensual)

> Spec: `docs/superpowers/specs/2026-06-15-sub-F-pdfs-design.md`. ADR: `docs/adr/0004-pdf-engine-spatie-gotenberg.md`. Estado: **DONE 2026-06-16** (branch `fase/F-pdfs`). Los 9 pasos completos; 3 PDFs verificados con render real; Pest 108 + Vitest 33 verdes.

Una fase = un commit (lo hace Giuliano). Cada paso tiene criterio de **Done**. Orden pensado para poder
verificar de a poco (infra → un PDF end-to-end → los otros dos → frontend → cierre).

## 1. Infra: Gotenberg + spatie/laravel-pdf

- `docker-compose.yml`: servicio `gotenberg` (`gotenberg/gotenberg:8`), red `appnet`, sin puerto público.
- `apps/api/.env.example` (+ entrypoint si auto-genera `.env`): `LARAVEL_PDF_DRIVER=gotenberg`, `GOTENBERG_URL=http://gotenberg:3000`.
- `composer require spatie/laravel-pdf luecano/numero-a-letras` (dentro del container php-fpm). Publicar config si aplica.
- **Done**: `docker compose up -d` levanta `gotenberg` healthy; `Pdf::view('pdf.smoke')->save()` desde tinker genera un PDF `%PDF` válido vía Gotenberg.

## 2. Config + assets de marca

- `config/inmobiliaria.php`: `name`, `locality` (Guatimozín), `address` (Catamarca 227), `phone`, `hours`, `cuit`, `commission_rate` (0.10).
- `apps/api/resources/pdf-assets/`: logo NZ + firma. Helper para embeber como data URI base64 en Blade (`pdf_asset('logo.png')` o similar).
- **Done**: un Blade de prueba muestra logo + datos de la inmobiliaria leídos de config, sin URLs externas.

## 3. Cálculos: ReceiptCalculator + número→letras

- `app/Support/ReceiptCalculator.php` (o accessors en `Receipt`): `receiptTotal()`, `commission()`, `settlementHandover()`, `monthlyHandover()`. Montos nulos → 0. `commission_rate` desde config.
- Helper/servicio `numberToWords()` envolviendo `luecano/numero-a-letras` (formato "Pesos …").
- Tests Pest unit de ambos (casos límite: montos nulos, redondeo, números grandes).
- **Done**: `pest --filter=ReceiptCalculator` y el de número→letras verdes; valores coinciden con el legacy (comisión 10%, total recibo sin arreglos/otros, entrega rendición).

## 4. Recibo individual (PDF)

- `resources/views/pdf/receipt.blade.php`: réplica del layout legacy + pulido (tipografía, espaciado, branding NZ). Header inmobiliaria + Nº/fecha; datos inquilino/contrato/dueño/mes-año/FP; tabla de cargos → total; total en letras; comentarios; firma.
- `app/Http/Controllers/Api/V1/ReceiptPdfController@receipt`; ruta `GET /api/v1/receipts/{receipt}/pdf` bajo `auth:sanctum` + `NoStoreHeaders`. Devuelve PDF inline.
- Feature test: 200 + `application/pdf` + `%PDF`; 401 sin auth; 404 recibo inexistente.
- **Done**: endpoint responde PDF válido; verificación visual del recibo real correcta.

## 5. Rendición (PDF)

- `resources/views/pdf/settlement.blade.php`: 3 columnas INGRESOS / EGRESOS (comisión + arreglos + otros) / ENTREGAS; título = dueño; comentarios; firma.
- `ReceiptPdfController@settlement`; ruta `GET /api/v1/receipts/{receipt}/settlement`.
- Feature test (igual que recibo) + chequeo de que la entrega = ingresos − egresos.
- **Done**: endpoint responde PDF válido; cálculos de la rendición correctos en el documento.

## 6. Listado mensual de pagos (PDF)

- `app/Http/Requests/Report/MonthlyPaymentsRequest.php`: `month` ∈ 12 meses ES, `year` int (rango 2000-2100).
- `MonthlyPaymentsReportController@__invoke`; ruta `GET /api/v1/reports/monthly-payments?month=&year=`.
- Query parametrizada (Eloquent): "Pagados" = recibos del mes/año (join contrato/inquilino/dueño); "No pagados" = contratos sin recibo ese mes (whereDoesntHave / leftJoin null). **Sin SQL crudo** (corrige SQLi del legacy).
- `resources/views/pdf/monthly-payments.blade.php`: A4 landscape, tablas Pagados (con comisión/entrega/cert.) y No Pagados.
- Feature test: 200 + `%PDF`; 422 con mes/año inválidos; el set respeta el filtro y separa pagados/no-pagados.
- **Done**: endpoint responde PDF válido; pagados y no-pagados correctos para un mes/año sembrado.

## 7. Frontend: botones inline + reporte mensual

- `features/receipts/pdf.ts` (o en `api.ts`): `openReceiptPdf(n)`, `openSettlementPdf(n)`, `openMonthlyReport(month, year)` → arman URL absoluta del endpoint y `window.open(url, '_blank')`.
- `features/receipts/columns.tsx`: 2 botones-ícono **inline** en la fila (Recibo `FileText`, Rendición `FileSpreadsheet`/`Files`), con `aria-label`, antes del menú "...".
- `ReceiptsPage.tsx` / toolbar: control mes (Select 12 `MONTHS`) + año (Input) + botón "Generar PDF" → `openMonthlyReport`.
- Vitest: spy sobre `window.open` confirma URL correcta para los 3 (recibo, rendición, mensual).
- **Done**: `tsc -b`, `pnpm lint`, `pnpm test` verdes; botones visibles en la fila.

## 8. Verificación end-to-end (obligatoria)

- `docker compose up -d --build` (con gotenberg), login en :8080.
- Generar los **3 PDFs reales** desde la tabla de Recibos (recibo, rendición) y el reporte mensual.
- Confirmar: abren en pestaña nueva, son `%PDF` válidos, layout/branding prolijo, y cálculos correctos (total, total-en-letras, comisión, entrega, pagados/no-pagados).
- **Done**: los 3 PDFs verificados a mano; resultado documentado.

## 9. Cierre

- `/security-review` del branch (foco: auth en endpoints PDF, no SQL crudo en el reporte, sin PII en logs).
- `docs/changelog.md` (entrada sub-F) + `docs/roadmap.md` (sub-F → DONE) + este plan marcado DONE.
- Sugerir commit Conventional (≤50 chars). Commit = Giuliano.
- **Done**: checklist de `git-workflow.md` cumplida; commit sugerido.

## Notas de implementación

- En tests, si Gotenberg no está disponible, usar el driver `dompdf` de spatie como fallback para no atar el suite a la red.
- Reutilizar `Receipt`/`Contract` (Eloquent) y sus relaciones; no duplicar queries.
- `NoStoreHeaders` ya existe (sub-D) — reusar en los endpoints PDF (PII).
- Frontend: NO correr `pnpm` en el host (genera `pnpm-workspace.yaml` basura que rompe el container `node-dev`); usar `docker compose exec node-dev …` o binarios directos.
