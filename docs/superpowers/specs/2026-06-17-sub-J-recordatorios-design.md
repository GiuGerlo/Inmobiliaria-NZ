# Sub-J — Recordatorios automáticos por WhatsApp — Design

- **Fecha**: 2026-06-17
- **Estado**: aprobado
- **Depende de**: sub-I (canal WhatsApp Cloud API + `WhatsAppClient` + `PhoneNumber`), sub-G (`DashboardData::pendingReceipts()`).

## Problema

El trabajo mensual es repetitivo y dos cosas se escapan: inquilinos que se olvidan de pagar el
alquiler, y recibos que el operador olvida emitir. Ya tenemos el canal WhatsApp (sub-I) y los datos
(`pendingReceipts`); falta el **disparo automático** de recordatorios.

## Objetivo

Dos recordatorios automáticos por WhatsApp, **activables/desactivables desde un panel**:

1. **Recordatorio de pago → inquilino**: a contratos activos **sin recibo del mes**, un **día fijo
   configurable** del mes.
2. **Aviso de pendientes → operador (interno)**: resumen de cuántos recibos faltan emitir, a un
   número de operador configurable.

## Decisiones (acordadas con el usuario)

1. **Disparo**: comando artisan `recordatorios:enviar` + scheduler de Laravel. El **cron real**
   (`schedule:run`) es infra de sub-H; por ahora se corre a mano. El comando se auto-filtra por día.
2. **Timing**: un **día del mes configurable** (`payment_reminder_day`, 1–28). El mismo día dispara el
   aviso interno.
3. **Panel de ajustes** (`/configuracion`): 2 toggles (on/off por recordatorio), día del mes, y
   teléfono del operador. Sin tocar código.
4. **Texto fijo por plantilla** (Meta, igual que sub-I): 2 plantillas de **texto** nuevas
   (`recordatorio_pago`, `aviso_pendientes`).
5. **Anti-duplicado**: un recordatorio por inquilino por mes; un aviso interno por mes. Tabla
   `reminder_logs`.
6. **Tabla nueva** `reminder_logs` (no reusar `whatsapp_messages`, que es receipt-céntrica con FK NOT
   NULL).

## Arquitectura

**Backend**
- `reminder_settings` (1 fila): `payment_reminder_enabled`, `pending_alert_enabled`,
  `payment_reminder_day`, `operator_phone`. Modelo `ReminderSettings::current()`.
- `reminder_logs`: `type`, `contract_id?`, `recipient_phone`, `period_month`, `period_year`,
  `meta_message_id?`, `status`, `error?`, `sent_at`. Anti-dup por (type, contract_id, mes, año).
- `WhatsAppClient::sendTemplate(to, template, lang, bodyVars)` — texto sin header de documento.
- `App\Support\ReminderRunner`: `paymentReminders()` (itera `pendingReceipts()`, valida tel con
  `PhoneNumber::toE164`, saltea inválidos/ya-enviados, manda plantilla, loguea) y `pendingAlert()`
  (resumen al operador, una vez/mes).
- `SendRemindersCommand` (`recordatorios:enviar`): lee settings, si hoy = día y el toggle on, corre
  cada bloque; imprime resumen. Registrado en `bootstrap/app.php` con `->withSchedule(...)` diario.
- Endpoints `GET`/`PUT /api/v1/reminder-settings` (`auth:sanctum` + FormRequest: día 1–28, phone
  normalizable) + `ReminderSettingsResource`.

**Frontend**
- `features/settings/` + `SettingsPage.tsx` (`/configuracion`): switches, día, teléfono del operador,
  guardar con toast. Nav item "Configuración".

## Manejo de errores

- Tel de inquilino inválido → se saltea ese contrato (log `failed`), el lote sigue.
- Falla de Meta → `reminder_logs.status=failed` + error; sigue el resto.
- Toggle off o día ≠ hoy → no manda. Sin `operator_phone` → no manda el aviso interno (avisa en el output).

## Testing

- Pest: `ReminderRunner` (`Http::fake`: solo pendientes con tel válido, anti-dup, saltea inválidos,
  1 aviso interno), `SendRemindersCommand` (toggles + día), `ReminderSettings` (GET/PUT + validación),
  `WhatsAppClient::sendTemplate`.
- Vitest: `SettingsPage` (switches/día/guardar) con MSW.

## Fuera de alcance

- Cron real en prod → sub-H. Recordatorio de pago basado en un "día de pago" por contrato (no se
  guarda; se usa "sin recibo del mes"). Escalonado/múltiples avisos. Opt-out por inquilino individual
  (solo toggle global).
