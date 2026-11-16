# 0011 — Auditoría con tabla propia (sin spatie/laravel-activitylog)

- **Estado**: aceptada
- **Fecha**: 2026-11-16
- **Contexto**: el superadmin necesita ver quién hizo qué (cambios de datos, accesos, envíos WhatsApp, PDFs).
  Las tablas legacy tienen PKs no estándar (`ID_Contrato`, `Nro_Recibo`, `settings.key` string) y varias
  sin timestamps.
- **Opciones consideradas**:
  - A) `spatie/laravel-activitylog`: maduro, pero dependencia nueva y más features de las que usamos
    (batches, causers polimórficos, logs nombrados).
  - B) Tabla `audit_logs` + trait `Auditable` (~40 líneas) + `AuditLog::record()` para eventos no-modelo.
- **Decisión**: B. `auditable_id` es string (PKs legacy mixtas), `user_id` null = Sistema/anónimo.
  `updated` guarda solo campos cambiados; nunca `$hidden` (password, tokens). Login fallido guarda solo
  el email.
- **Consecuencias**:
  - Escrituras masivas del query builder (`->update()` sobre queries) no quedan auditadas.
  - Estados del webhook de WhatsApp no se auditan (ya viven en `whatsapp_messages`).
  - La tabla crece sin límite: revisar retención (`Prunable` + scheduler) cuando pese.
  - Los logs contienen PII (nombres, teléfonos): solo superadmin (gate `view-audit`), respuesta `no-store`.
