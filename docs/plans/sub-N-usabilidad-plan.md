# Plan sub-N — Usabilidad del admin

- **Spec**: `docs/superpowers/specs/2026-11-15-sub-N-usabilidad-design.md`
- **Rama**: `fase/N-usabilidad` (un commit, lo hace el usuario)
- **Estado**: 🟢 DONE

## Pasos

- [x] 1. Backend estados de entrega: `WhatsAppMessage` (rank + `documentBody`), webhook `messages.statuses`,
      `ReceiptController` (accepted + último estado por tipo), `ReceiptResource`, batch cuenta accepted.
      **Done**: Pest del webhook cubre subir / no retroceder / failed / id desconocido.
- [x] 2. `whatsapp:test` guarda destinatario, contrato y cuerpo. **Done**: fila del historial completa.
- [x] 3. Front WhatsApp: tipos + labels Entregado/Leído en historial y progreso de lote.
- [x] 4. Recordatorio de pago preselecciona solo inquilinos sin recibo del mes + botón "Solo sin recibo" + marca "sin recibo" (no "pagó": un inquilino sin contrato activo no pagó).
      **Done**: Vitest de preselección.
- [x] 5. Nuevo recibo: fecha/mes/año de hoy + precarga alquiler y forma de pago del último recibo.
      **Done**: Vitest de precarga.
- [x] 6. Tilde por botón (Recibo/Rendición) con color por estado + "Reenviar · enviado dd/mm".
- [x] 7. `.htaccess` 302 del legacy (`tools/legacy-redirect/.htaccess`), subido y verificado 2026-11-15.
- [x] 8. Pest + Vitest + lint verdes; guía de QA manual; roadmap/changelog; mensaje de commit sugerido.
- [x] 9. Campo `messages` del webhook: ya estaba suscripto; estados verificados en prod (leído 21:12:50).

## Ampliación 2026-11-15

- [x] 10. Migración `delivered_at`/`read_at` + webhook los guarda + filtros `q`/`from`/`to`/`receipt_id` en el historial. **Done**: Pest.
- [x] 11. Recordatorio de pago en dos paneles (buscador + lista alfabética | seleccionados con ✕). **Done**: Vitest.
- [x] 12. Tooltip del botón Recibo/Rendición con estado + leyenda de colores + "Envíos por WhatsApp" en el detalle del recibo.
- [x] 13. Historial con buscador, desde/hasta, tipo y estado; detalle con entregado/leído. **Done**: Vitest.

## Ampliación 2 — 2026-11-15

- [x] 14. Fixes de prod: fecha del menú "Reenviar · enviado" + `index.html` sin cache (test `SpaFallbackTest`).
- [x] 15. Ayuda por página (`features/help`): botón en la barra superior + panel con ejemplos; test de cobertura del menú.

> ✅ DONE — 2026-11-15
