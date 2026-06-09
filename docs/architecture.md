# Arquitectura

> Este documento se va a expandir al cerrar cada sub-proyecto. Hoy = foto inicial + plan de transición.

## Hoy (legacy)

```
[Navegador]
    │
    ▼
[Apache/PHP — Hostinger compartido]
    │
    ├── PHP procedural (.php top-level + controlador/*.php)
    ├── Sesiones server-side ($_SESSION['admin'])
    ├── dompdf (vendored) → recibos y rendición mensual
    │
    ▼
[MariaDB 10.x — Hostinger]
    └── Tablas: ciudad, contrato, dueno, formadepago,
                inquilino, propiedad, recibo, users
```

**Problemas conocidos** (ver `docs/legacy/snapshot-php.md`):

- SQL concatenado (injection).
- MD5 para passwords.
- Credenciales productivas en `includes/conexion.php`.
- Sin CSRF, sin headers, sin rate limit.
- Sin tests, sin CI.

## Destino

```
[Navegador]
    │
    ▼
[Nginx]
    ├── /        → React SPA (build estático)
    └── /api/v1  → Laravel (PHP 8.5-FPM)
                       │
                       ▼
                  [MariaDB 11.8]
                       │
                  [Redis] (sub-G+)
```

- **React SPA** maneja UI y estado cliente. Sirve build estático.
- **Laravel API** maneja datos, auth (Sanctum), PDF, jobs.
- **MariaDB 11.8** como DB principal — espejo de prod.
- **Redis** opcional desde sub-G en adelante para cola y cache.

## Transición

Durante las fases A–D, el legacy sigue corriendo en su URL actual. El nuevo stack levanta en local (Docker) y en preview (cuando se decida deploy).

- **Sub-A** estaba en paralelo, no toca legacy.
- **Sub-B–D** preparan API + datos sin reemplazar la UI.
- **Sub-E** habilita el frontend nuevo. Switch en producción al final de F.
- Eventualmente legacy → deprecate, no eliminar hasta confirmar paridad.

## Diagramas pendientes

Se irán agregando a medida que aparezcan: ERD post-rename (sub-B), flujo de auth (sub-C), secuencia de generación de recibo (sub-F), pipeline CI/CD (sub-H).
