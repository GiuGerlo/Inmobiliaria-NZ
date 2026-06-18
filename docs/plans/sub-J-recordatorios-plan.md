# Plan — Sub-J: Centro de mensajes WhatsApp (manual)

> Spec: `docs/superpowers/specs/2026-06-17-sub-J-recordatorios-design.md`. Estado: **DONE 2026-06-17**
> (código + tests; branch `fase/J-recordatorios`). Pest 132 + Vitest 42 verdes. Pendiente del usuario:
> aprobar 2 plantillas de texto en Meta + verificación real.
>
> **Nota**: sub-J se **redefinió** tras hablar con la dueña. El primer prototipo (recordatorios
> automáticos por cron: `reminder_settings`/`reminder_logs`/`ReminderRunner`/comando/scheduler/panel
> `/configuracion`) se **descartó** y no se commiteó. Quedó esta versión **manual**.

## Lo que se hizo

1. **Historial unificado** — `whatsapp_messages` generalizada (migraciones `*_generalize_*` y
   `*_add_template_*`): `receipt_id` nullable + `batch_id`, `contract_id`, `recipient_name`, `body`,
   `template`, `template_vars`, `type` a 30 chars. sub-I (`ReceiptWhatsAppController`) ahora guarda
   `recipient_name` + `body`.
2. **Envío** — `WhatsAppClient::sendTemplate()` (texto), `App\Support\WhatsAppSender::send()`
   (envía una fila por su plantilla+vars, marca sent/failed), job `SendBulkReminder` (`afterResponse`,
   procesa las filas `queued` del lote una por una).
3. **Endpoints** (`auth:sanctum` + throttle, en `routes/api.php`):
   `POST /whatsapp/payment-reminders` (lote → 202 `{batch_id,total,skipped}`),
   `POST /whatsapp/missing-items` (envío inmediato, 422 si tel inválido),
   `GET /whatsapp/messages` (historial), `GET /whatsapp/batches/{id}` (estado para el progreso),
   `POST /whatsapp/batches/{id}/retry` (reenvía solo los fallidos). Requests en
   `app/Http/Requests/WhatsApp/`. `WhatsAppMessageResource` ampliado.
4. **Frontend** `features/whatsapp/` + ruta `/recordatorios` + nav: `RemindersPage` (3 pestañas),
   `PaymentReminderTab` (checklist + preview + `ConfirmDialog` sin doble confirmación),
   `BatchProgress` (poll-ea `useBatch` cada 1.5s, ✓/✗ por destinatario, contadores, reintentar
   fallidos), `MissingItemsTab` + `MissingItemsDialog` (acción + conceptos → texto editable +
   preview), `MessageHistory` (tabla unificada).
5. **Config/env**: `WHATSAPP_TEMPLATE_RECORDATORIO_PAGO`, `WHATSAPP_TEMPLATE_RECORDATORIO_FALTANTE`.
6. **Tests**: Pest (PaymentReminders, MissingItems, WhatsAppMessages historial+batch+retry,
   SendBulkReminder, sendTemplate). Vitest (`RemindersPage`: pago/faltantes/historial).

## Pendiente del usuario (Meta)

Crear y aprobar 2 plantillas de **texto**:
- `recordatorio_pago` — body `{{1}}`=mes, `{{2}}`=fecha límite ("Buen día! En el mes de {{1}}…ZARANICH.").
- `recordatorio_faltante` — body `{{1}}`=nombre, `{{2}}`=instrucción ("Hola {{1}}, desde Estudio
  Zaranich te recordamos: {{2}}. ¡Gracias!").

Luego: nombres en `.env` → `config:clear` → probar en `/recordatorios` (pago masivo a tu número de
prueba + faltantes), ver el progreso y el historial.

## Producción (sub-H)

El envío masivo corre con `afterResponse` sobre cola `sync`; para lotes grandes, en deploy pasar a
`QUEUE_CONNECTION=database` + worker (`queue:work`).

> ✅ DONE — 2026-06-18 (incluye ajustes UX post-feedback: menú Ver/Enviar, selector mes/año, hora
> formateada, body real en historial). Pest 134 + Vitest 43 verdes; `/security-review` sin hallazgos.
> Falta solo aprobar las 2 plantillas de recordatorios en Meta para mergear a `main`.
