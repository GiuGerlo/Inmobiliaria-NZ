# Plan sub-O — Archivar contratos + Auditoría

- **Spec**: `docs/superpowers/specs/2026-11-16-sub-O-contratos-auditoria-design.md`
- **ADR**: `docs/adr/0011-auditoria-tabla-propia.md`
- **Rama**: `fase/O-contratos-auditoria` (un commit, lo hace el usuario)
- **Estado**: 🟢 DONE

## Pasos

- [x] 1. Migración `archived_at` (nullable + índice) en `contrato`.
- [x] 2. `scopeActive` excluye archivados + `scopeNotArchived` en saldo pendiente y listado mensual.
- [x] 3. `filter[archived]` (default vigentes / `1` / `all`), endpoints archive/unarchive, 409 con
      `code: has_receipts`, `StoreReceiptRequest` rechaza archivados, `archived_at` en el resource.
      **Done**: `ContractArchiveTest`.
- [x] 4. Front contratos: Vigentes/Archivados, Archivar/Reactivar, 409 → ofrece archivar, filtro de Recibos
      con archivados, ayuda. **Done**: Vitest borrar→archivar→reactivar.
- [x] 5. Migración `audit_logs` + `AuditLog::record` + trait `Auditable` en 12 modelos.
- [x] 6. Listeners Login/Logout/Failed + `WhatsAppMessage::created` + PDFs; gate `view-audit`;
      `GET /audit-logs` con filtros. **Done**: `AuditLogTest` (diff, sin password, accesos, WhatsApp, 403).
- [x] 7. Front `/auditoria` (menú superadmin) con filtros y detalle antes/después + ayuda.
      **Done**: Vitest `AuditPage`.
- [x] 8. Pest 213 + Vitest 72 verdes; prueba en navegador (8080); roadmap/changelog; commit sugerido.
