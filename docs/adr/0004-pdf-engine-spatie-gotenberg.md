# 0004 — Motor de PDF: spatie/laravel-pdf + Gotenberg (Chromium)

- **Estado**: aceptada — **driver revisado 2026-06-29** (ver "Revisión Fase 6")
- **Fecha**: 2026-06-15
- **Sub-proyecto**: F (motor) · Fusión NZ Fase 6 (revisión de driver)

## Contexto

Sub-F genera los 3 documentos entregables del sistema (recibo, rendición, listado mensual). Son lo más
importante del producto, así que la calidad de render importa. El legacy los arma con **dompdf** (PHP puro)
y, aunque funciona, dompdf tiene CSS limitado (flexbox flojo, layouts a fuerza de tablas, fuentes/acentos
que a veces hay que embeber a mano). El stack objetivo (`.claude/rules/stack.md`) dejó esta decisión abierta:
"spatie/laravel-pdf o dompdf vía Laravel". Hay que elegir motor para la fase.

Restricciones: el entorno es Docker Compose (nginx + php-fpm + mariadb + node + legacy); no queremos inflar
la imagen php-fpm con Node + Chromium si hay una alternativa más limpia. El usuario pidió "réplica + pulido
visual leve" y máxima calidad de los documentos.

## Opciones consideradas

### A — spatie/laravel-pdf v2 con driver Gotenberg

- **Pros**: Chromium real → CSS moderno completo (flexbox/grid, fuentes web, acentos perfectos), calidad
  pixel-perfect ideal para documentos entregables. Gotenberg corre como **contenedor aparte**
  (`gotenberg/gotenberg:8`); php-fpm lo llama por HTTP interno → la imagen php-fpm queda igual de liviana.
  API Blade-first (`Pdf::view(...)`), bien integrada a Laravel.
- **Contras**: un servicio más en el compose; en CI/tests hay que tener Gotenberg o usar un driver fallback.

### B — spatie/laravel-pdf v2 con driver Browsershot

- **Pros**: misma calidad Chromium, sin contenedor extra.
- **Contras**: requiere Node + Puppeteer + Chromium **dentro** de la imagen php-fpm (~300 MB, build más
  lento, más superficie que mantener).

### C — dompdf (barryvdh/laravel-dompdf)

- **Pros**: PHP puro, liviano, sin deps nuevas; mismo motor que el legacy (layout ya probado).
- **Contras**: CSS limitado (flexbox flojo), tipografía/acentos requieren embeber fuentes; poco margen para
  el "pulido visual" pedido.

## Decisión

**A — spatie/laravel-pdf v2 + Gotenberg** (elegido por el usuario). Se agrega el servicio `gotenberg` a
`docker-compose.yml` (red `appnet`, sin puerto público); `.env`: `LARAVEL_PDF_DRIVER=gotenberg`,
`GOTENBERG_URL=http://gotenberg:3000`. Las vistas son Blade en `resources/views/pdf/`. El número→letras usa
`luecano/numero-a-letras`. En tests, si Gotenberg no está disponible, se usa el driver `dompdf` de spatie
como fallback.

## Consecuencias

- Nuevo contenedor `gotenberg` en local y en deploy (sub-H debe contemplarlo; si Hostinger compartido no
  corre containers, se evalúa Gotenberg gestionado o Browsershot — se revisita en sub-H).
- La imagen php-fpm no cambia (no se le agrega Chromium).
- Los assets de PDF (logo, firma) se embeben como data URI en los Blade; no dependen de URLs externas.
- CI necesita Gotenberg o el fallback dompdf para los tests de PDF.

## Revisión Fase 6 (2026-06-29) — driver Gotenberg → dompdf

El propio bloque "Consecuencias" anticipó el riesgo: "si Hostinger compartido no corre containers, se
evalúa Gotenberg gestionado o Browsershot". Confirmado en Fase 6 que **prod = Hostinger compartido sin
Docker** (cierra ADR-0003 para la API), Gotenberg/Browsershot/Chrome quedan descartados (todos requieren
Chromium o binarios externos). WeasyPrint necesita Python → no. Queda **dompdf** (PHP puro), que
`spatie/laravel-pdf` ya soporta como driver.

**Cambio**: `LARAVEL_PDF_DRIVER=gotenberg` → `dompdf`; `composer require dompdf/dompdf`; servicio
`gotenberg` eliminado de `docker-compose.yml`. **La API de render no cambia** (`Pdf::view()->format()
->landscape()->inline()`), así que `ReceiptPdf`, `PdfAsset` y los controllers quedan intactos. Único costo:
dompdf no soporta flexbox → se convirtieron 3 layouts flex a tabla (`brand-header`, `brand-left`, `parties`
en los Blade). Render real de los 3 PDFs verificado con fidelidad equivalente (header, alineaciones,
backgrounds navy, acentos, footer fijo, landscape multipágina). Se mantiene `spatie/laravel-pdf` como capa
de abstracción por si en un futuro VPS se quiere volver a un motor Chromium (sería solo flip de driver).

## Referencias

- Spec: `docs/superpowers/specs/2026-06-15-sub-F-pdfs-design.md`.
- spatie/laravel-pdf v2 (driver-based: Browsershot, Gotenberg, Cloudflare, WeasyPrint, DOMPDF, Chrome).
