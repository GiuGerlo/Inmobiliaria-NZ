# 0005 — PHP version pinning a 8.4

- **Estado**: aceptada
- **Fecha**: 2026-06-08
- **Sub-proyecto**: A (afecta todo el backend)

## Contexto

El usuario originalmente pidió PHP 8.5 ("el más reciente para no quedar antiguo"). PHP 8.5 salió en noviembre 2025; al momento de esta decisión (junio 2026) ya tiene ~7 meses. Hay que decidir entre la versión más nueva (8.5) o una más conservadora (8.4) para arrancar el proyecto.

## Opciones consideradas

### A — PHP 8.5 con fallback a 8.4

- **Pros**: Features más nuevas (clones asimétricos visibility, pipe operator, etc.).
- **Contras**: Algunos paquetes del ecosistema (dompdf, spatie, etc.) pueden no haber confirmado soporte 8.5 todavía. Fallback agrega complejidad de Dockerfile.

### B — PHP 8.4 fijo (elegida)

- **Pros**:
  - 8.4 es la más reciente con tracking completo de extensions de terceros.
  - Laravel 12 / 13 corren bien.
  - Cero sorpresas con dependencias.
- **Contras**: No usamos features 8.5. No es un problema real — features no son críticos para una app CRUD de admin.

### C — PHP 8.5 sin fallback (build propio)

- **Pros**: Control total.
- **Contras**: Mantener un Dockerfile que compila PHP es un trabajo a largo plazo. Innecesario.

## Decisión

**B — PHP 8.4 fijo.**

Razones:
- Estabilidad sobre novedad para una app productiva.
- Imagen oficial `php:8.4-fpm-alpine` es estándar y confiable.
- Upgrade a 8.5 = ADR + sub-fase futura cuando todo el ecosistema (dompdf, spatie, librerías de PDF, etc.) lo confirme.

## Consecuencias

- `docker/php/Dockerfile` usa `FROM php:8.4-fpm-alpine`.
- `apps/api/composer.json` declara `"php": "^8.3"` (compatibilidad amplia hacia atrás; el container fija 8.4).
- `.claude/rules/stack.md` documenta 8.4 como versión actual.
- Cuando salga la idea de subir a 8.5: crear ADR-XXXX que reemplace este, probar paquetes en branch, mergear.

## Referencias

- Spec: `docs/superpowers/specs/2026-06-08-sub-A-infra-bootstrap-design.md`.
- `.claude/rules/stack.md`.
