# Sub-F — PDFs (recibo, rendición, listado mensual) — Design

- **Fecha**: 2026-06-15
- **Estado**: aprobado
- **Depende de**: sub-D (API REST + modelos Receipt/Contract), sub-E (frontend de Recibos).

## Problema

Los PDFs son **lo más importante del sistema**: son los documentos que se entregan a los clientes
(recibo al inquilino, rendición al dueño) y el control interno mensual de la inmobiliaria. El legacy
los genera con dompdf en 3 scripts procedurales y su armado tiene buena calidad. En la app nueva esa
funcionalidad todavía no existe: sub-E dejó el CRUD de Recibos pero los 3 botones de PDF se difirieron
a esta fase.

## Objetivo

Replicar los 3 documentos del legacy en la stack nueva (Laravel 12 + React) con **réplica fiel + pulido
visual leve** (misma estructura y datos, mejor tipografía/espaciado/branding NZ, y corrigiendo bugs),
y mejorando la **calidad de render** del motor de PDF.

## Documentos a replicar (origen legacy)

Origen: `legacy/controlador/generar-recibo.php`, `legacy/controlador/generar-rendicion.php`,
`legacy/pagos.php`, util `legacy/templates/utils.php`.

1. **Recibo individual** (inquilino): header de la inmobiliaria + Nº + fecha de emisión; datos del
   inquilino (nombre, tel, "IVA: Consumidor Final"), del contrato (inicio/fin), "En concepto de:
   Alquiler", dirección, dueño, mes/año, forma de pago; tabla de cargos (Alquiler, Municipal, Agua,
   Electricidad, Gas, **Honorarios**) → **Total**; **total en letras**; comentarios; firma.
   ⚠️ El total del recibo **no** incluye Arreglos ni Otros.
2. **Rendición de cuentas** (dueño): título = nombre del dueño; 3 columnas —
   **INGRESOS** (Fecha, Inquilino, Mes/Año, Alquiler, Municipal, Agua, Electricidad, Gas) /
   **EGRESOS** (Comisión = 10% del alquiler, Arreglos, Otros) /
   **ENTREGAS** (Total = suma ingresos − suma egresos); comentarios; firma.
3. **Listado mensual de pagos** (A4 landscape, por mes+año): tabla **Pagados** (Fecha pago, Inquilino,
   Dueño, inicio contrato, Mun., Agua, Gas, Electr., Imp.=Alquiler, **Comisión**, **Entrega**,
   Honorarios, Cert.) + tabla **No Pagados** (contratos sin recibo ese mes: Inquilino, Dueño, inicio,
   Precio propiedad, Certificación).

## Decisiones (acordadas con el usuario)

1. **Fidelidad**: réplica + pulido visual leve (no rediseño).
2. **Motor**: `spatie/laravel-pdf` v2 con driver **Gotenberg** (ADR-0004). Chromium real en contenedor
   aparte; no infla la imagen php-fpm.
3. **Entrega**: cada PDF se abre **inline en pestaña nueva** (igual al legacy).
4. **Botones**: los de PDF (recibo + rendición) van **inline en la fila** de la tabla de Recibos
   (íconos visibles, estilo legacy verde/celeste), no dentro del menú "...". El reporte mensual va en
   el toolbar (mes + año + "Generar PDF").
5. **Verificación end-to-end obligatoria**: levantar el stack con Gotenberg y generar los 3 PDFs reales,
   confirmando que abren, son `%PDF` válidos y que layout/datos/cálculos son correctos.

## Arquitectura

**Infra**: nuevo servicio `gotenberg` (`gotenberg/gotenberg:8`) en la red `appnet` del compose, sin
puerto público. php-fpm le manda el HTML renderizado del Blade y Gotenberg devuelve el PDF por HTTP
interno (`GOTENBERG_URL=http://gotenberg:3000`, `LARAVEL_PDF_DRIVER=gotenberg`).

**Backend**: 3 endpoints GET bajo `auth:sanctum` + `NoStoreHeaders` (PII, `Cache-Control: no-store`):
- `GET /api/v1/receipts/{receipt}/pdf` → recibo.
- `GET /api/v1/receipts/{receipt}/settlement` → rendición.
- `GET /api/v1/reports/monthly-payments?month=&year=` → listado mensual.

Cada endpoint arma su modelo (Eloquent, con relaciones), pasa los datos a un Blade en
`resources/views/pdf/` y devuelve el PDF inline (`Pdf::view()->name()`). Los cálculos viven en un único
`App\Support\ReceiptCalculator` (fuente de verdad reutilizada por recibo, rendición y reporte):
`receiptTotal`, `commission` (alquiler × `commission_rate`), `settlementHandover`. El conversor
número→letras usa `luecano/numero-a-letras` (reemplaza el util buggy del legacy que escribía
"docientos"/"trecientos"). El reporte mensual usa query builder **parametrizado** (el legacy
interpolaba `$mes`/`$ano` → SQL injection, se corrige).

**Datos fijos** (localidad Guatimozín, dirección Catamarca 227, tel, horario, CUIT) y el `commission_rate`
(0.10) van a `config/inmobiliaria.php`, no hardcodeados en el Blade. Logo NZ + firma se embeben como
**data URI base64** en los Blade (assets en `apps/api/resources/pdf-assets/`), evitando el bug legacy de
URLs `http://localhost/...` y que Gotenberg no alcance la imagen.

**Frontend**: en `features/receipts/`, 2 botones-ícono inline por fila (Recibo, Rendición) + control
mes/año/"Generar PDF" en el toolbar. Todos hacen `window.open(<url absoluta del endpoint>, '_blank')`;
la cookie Sanctum viaja en la navegación (mismo dominio :8080).

## Reglas de negocio (preservadas del legacy)

- `commission_rate` = 10% del alquiler (`Pago_Propiedad`).
- **Total recibo** = Alquiler + Municipal + Agua + Electricidad + Gas + Honorarios.
- **Entrega rendición** = (Alquiler + Municipal + Agua + Electricidad + Gas) − (Comisión + Arreglos + Otros).
- **Entrega en reporte mensual** = (Alquiler + Municipal + Agua + Gas + Electricidad) − Comisión.
- "No pagados" = contratos que no tienen recibo para ese mes/año.

## Manejo de errores

- **401** sin sesión → la navegación a la URL del PDF cae en el guard / responde 401.
- **404** recibo inexistente → route model binding.
- **422** en el reporte si `month`/`year` inválidos (FormRequest: mes ∈ 12 meses ES, año entero).
- Falla de Gotenberg → 500 con log; el front no rompe (pestaña con error).

## Testing

- **Pest**: unit de `ReceiptCalculator` (total, comisión, entrega; montos nulos→0) y del número→letras.
  Feature: los 3 endpoints → 200 + `Content-Type: application/pdf` + cuerpo `%PDF`; 401 sin auth;
  el reporte filtra por mes/año y arma "no pagados". En tests, si Gotenberg no está disponible se usa el
  driver `dompdf` de spatie como fallback (decisión de implementación).
- **Vitest**: los botones inline y el botón mensual llaman `window.open` con la URL correcta (spy).
- **Manual end-to-end**: `docker compose up -d --build`, login en :8080, generar los 3 PDFs reales y
  verificar validez + layout + cálculos.

## Fuera de alcance (YAGNI)

- Envío de PDFs por email / WhatsApp (candidato sub-G).
- Plantillas configurables por el usuario.
- Histórico/versionado de PDFs generados.

## Referencias

- ADR-0004 (motor de PDF). Plan: `docs/plans/sub-F-pdfs-plan.md`.
- Legacy: `legacy/controlador/generar-recibo.php`, `generar-rendicion.php`, `legacy/pagos.php`, `legacy/templates/utils.php`.
