# sub-O — Archivar contratos + Auditoría (design)

- **Fecha**: 2026-11-16
- **Origen**: Nadina quiere sacar contratos vencidos y el borrado responde 409 porque tienen recibos
  (histórico). Borrar no es correcto; falta un estado "fuera de circulación". De ahí surge también la
  necesidad de saber quién hace qué en el sistema → panel de auditoría para el superadmin (misma fase).

## 1. Archivar contratos

Decisiones (usuario):
- **Archivar a mano** (`contrato.archived_at`). No automático por `F_Fin`: un contrato vencido puede seguir
  cobrándose mientras se carga la renovación.
- **Eliminar** queda solo para contratos cargados por error (sin recibos). Con recibos → 409
  `code: has_receipts` y el front ofrece archivar.
- Un archivado **se oculta en todos lados** (lista de contratos, selector de nuevo recibo, dashboard,
  recordatorios, listado mensual de impagos) **salvo el histórico**: recibos viejos y el filtro "Contrato"
  de Recibos lo siguen mostrando.
- Solo contratos (no inquilinos/dueños/propiedades). Reversible ("Reactivar").

Diseño:
- `Contract::scopeActive` excluye archivados (cubre dashboard y preselección de recordatorios);
  `scopeNotArchived` para saldo pendiente y listado mensual.
- `GET /contracts?filter[archived]=` default vigentes · `1` archivados · `all` todos.
- `POST|DELETE /contracts/{id}/archive`. `StoreReceiptRequest` rechaza contrato archivado (editar recibos
  viejos sigue permitido).
- Front: Contratos con "Vigentes / Archivados", acciones Archivar/Reactivar; filtro de Recibos usa `all`.

## 2. Auditoría (solo superadmin)

Qué se registra (usuario): altas/cambios/bajas de datos, login/logout/intentos fallidos, envíos por
WhatsApp y PDFs abiertos. Ver ADR-0011.

Diseño:
- Tabla `audit_logs` (`user_id` null = Sistema/anónimo, `event`, `auditable_type/id`, `old_values`,
  `new_values`, `ip`, `user_agent`, `created_at`).
- Trait `Auditable` (eventos Eloquent created/updated/deleted) en los modelos de dominio + User + Setting.
  `updated` guarda solo campos cambiados (antes/después). Excluye `$hidden` (password, tokens) y timestamps.
- `Login`/`Logout`/`Failed` (este último solo con el email intentado). `WhatsAppMessage::created` =
  un envío (`whatsapp.<tipo>`); los cambios de estado del webhook no se auditan (ya están en
  `whatsapp_messages`). PDFs: `pdf.recibo` / `pdf.rendicion`.
- `GET /api/v1/audit-logs` (gate `view-audit`), filtros usuario/acción (prefijo: `whatsapp`, `pdf`)/tipo/
  id/fechas. Solo lectura.
- Front `/auditoria` (menú superadmin): tabla Fecha/Usuario/Acción/Registro + detalle antes/después + IP.

Fuera de alcance: retención/purga de logs (agregar `Prunable` + scheduler cuando la tabla pese),
export CSV, escrituras masivas del query builder (no disparan eventos).
