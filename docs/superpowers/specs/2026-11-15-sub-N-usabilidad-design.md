# sub-N — Usabilidad del admin + estados de entrega WhatsApp + redirect legacy (diseño)

- **Estado**: aprobado 2026-11-15
- **Plan**: `docs/plans/sub-N-usabilidad-plan.md`

## Contexto
La simulación en prod (2026-11-15) funcionó, pero mostró fricciones: el recordatorio de pago arranca
con los 79 inquilinos tildados (riesgo de mandar a todos), el nuevo recibo se carga todo a mano,
"Año" muestra un placeholder que parece valor, el "ya enviado" por WhatsApp es un ícono suelto poco
claro, "Enviado" = aceptado por Meta (no sabemos si llegó) y `whatsapp:test` deja filas sin
destinatario/mensaje en el historial. Además el legacy sigue en uso → hay que redirigirlo al nuevo admin.
Todo local; el usuario revisa antes de commitear (rama `fase/N-usabilidad`, un commit).

Decisiones tomadas en brainstorming:
- Precarga de recibo: **alquiler + forma de pago** del último recibo del contrato.
- Recordatorio: **tildados solo los sin recibo del mes**.
- Indicador: **tilde en cada botón** (Recibo / Rendición) con color por estado.
- Entrega: **extender `status`** existente (sin migración).

## 0. Docs primero
- `docs/superpowers/specs/2026-11-15-sub-N-usabilidad-design.md` (este diseño, corto).
- `docs/plans/sub-N-usabilidad-plan.md` (pasos de abajo).
- `docs/roadmap.md`: fila **N** 🟡 + nota de sub-M (plantillas APPROVED + envío real con plantilla OK 2026-11-15).

## 1. Backend (apps/api)
- `app/Models/WhatsAppMessage.php` — ya tiene `STATUS_DELIVERED`, `STATUS_READ`, `ACCEPTED_STATUSES`
  (agregado antes de frenar). Sumar `STATUS_RANK` (queued 0, sent 1, delivered 2, read 3) y
  `documentBody(type, name, period)` estático con el texto que hoy arma `ReceiptWhatsAppController`
  (para reusarlo en el comando).
- `WhatsAppWebhookController::receive` — además de `account_update`, procesar `field === 'messages'`:
  recorrer `value.statuses[]`, buscar por `meta_message_id`:
  - `failed` → status failed + `error` = "código: título" de `errors[0]`.
  - `delivered`/`read`/`sent` → actualizar solo si el rank sube (llegan desordenados).
  - id desconocido → ignorar. `value.messages` (entrantes de coexistencia) → ignorar, no se guardan.
  - Log solo `{id, status}`; nunca payload (PII). Siempre 200.
- `ReceiptController::index` — `withMax … sent_at` pasa de `status = sent` a `whereIn ACCEPTED_STATUSES`;
  agregar subselect del **estado del último mensaje** por tipo (`whatsapp_recibo_status`,
  `whatsapp_rendicion_status`) y exponerlos en `ReceiptResource`.
- `WhatsAppMessageController::batch` — `sent` cuenta `ACCEPTED_STATUSES`.
- `WhatsAppTestCommand` — guardar `contract_id`, `recipient_name` del inquilino/dueño y `body` vía
  `documentBody` (punto 7).
- Tests Pest: `WhatsAppWebhookTest` (delivered sube, read sube, no retrocede, failed con error,
  id desconocido, firma inválida sigue 401); test de index de recibos con el estado; batch cuenta delivered.

## 2. Frontend (apps/web/src/features)
- `whatsapp/types.ts` — `WhatsAppStatus` += `delivered | read`. `MessageHistory.tsx` labels
  "Entregado"/"Leído" + estilos; `BatchProgress.tsx` trata delivered/read como OK.
- `whatsapp/PaymentReminderTab.tsx` — reusar `useDashboard()` (`features/dashboard/queries.ts`):
  `pending_receipts[].tenant_id` = default seleccionado. Estado `selected: Set | null`
  (null = usar default, sin effect). Botón extra "Solo sin recibo"; marca chica "pagó" en los que ya
  tienen recibo del mes.
- `receipts/ReceiptFormDialog.tsx` (solo modo crear):
  - defaults: `paid_at` = hoy (fecha local), `month` = mes actual, `year` = año actual; sacar placeholder "2026".
  - al cambiar el contrato: `listReceipts({page:1, perPage:1, contractId})` (orden default `-number`)
    → setear `property_amount` y `payment_method_id` (+ label del combobox con
    `payment_method.description`). Sin recibo previo → no toca nada.
- `receipts/columns.tsx` + `ReceiptDetailDialog.tsx` — quitar el ícono suelto; nuevo componente chico
  `receipts/SentMark.tsx` (tilde sobre el botón: verde entregado/leído, gris enviado, rojo falló;
  tooltip con fecha + estado). Ítem de menú: "Reenviar al inquilino · enviado 15/11" si ya se envió.
  `receipts/types.ts` += `whatsapp_recibo_status`, `whatsapp_rendicion_status`.
- Tests Vitest: preselección del recordatorio (MSW dashboard + tenants), precarga del recibo.

## 3. Redirect legacy
- `.htaccess` en la raíz del legacy (cuando el usuario pase el repo):
  `RewriteEngine On` / `RewriteRule ^ https://admin.nz-estudiojuridicoinmobiliario.com/ [R=302,L]`.
  **302, no 301**: el legacy queda "por si se retrasa"; un 301 lo cachean los browsers y no se puede deshacer.
- Se sube recién junto con el dump final (orden: redirect → dump → re-sync). No en este paso.

## 4. Fuera de alcance / pasos de Meta
- Suscribir el campo **`messages`** en el webhook de la app Meta (lo hace el usuario en el panel o yo vía
  Meta MCP con su OK) **después** del deploy; sin eso los estados no llegan (todo sigue funcionando como hoy).

## Verificación
- `docker compose exec php ./vendor/bin/pest` y `docker compose exec web pnpm test` (Docker Desktop prendido).
- Local `http://localhost:5173` (o el puerto del stack): crear recibo → contrato con recibo previo precarga
  alquiler + forma de pago, fecha/mes/año de hoy; Recordatorios → solo los sin recibo tildados; tabla con
  tilde por botón; historial con "Entregado/Leído" simulando webhook firmado desde test/tinker.
- Guía de QA manual al usuario + mensaje de commit sugerido (lo commitea él).

---

## Ampliación 2026-11-15 (feedback de la revisión)

### Contexto
La primera tanda de sub-N ya está implementada en `fase/N-usabilidad` (sin commit): preselección
"sin recibo", precarga del recibo, tilde por documento, estados entregado/leído/falló vía webhook,
`whatsapp:test` completo. Al revisarla, el usuario pidió:
1. Recordatorio de pago: buscador y ver los seleccionados juntos (hoy 2 columnas sin orden, hay que scrollear).
2. Leyenda de los colores del tilde.
3. Fechas de enviado/entregado/leído visibles: el hover del tilde no muestra nada (bug: `pointer-events-none`
   + `title` nativo) y no hay forma de ver el historial de un recibo sin ir a Recordatorios.
4. Historial: buscador por nombre/teléfono, rango de fechas, tipo y estado.

Decisiones: **dos paneles** (todos con buscador | seleccionados con ✕). Historial: **buscador + desde/hasta +
tipo + estado** (sin columnas extra ni paginado nuevo — se siguen mostrando los últimos 50 del filtro).

### 1. Backend (apps/api)
- **Migración** `2026_11_15_000001_add_delivery_timestamps_to_whatsapp_messages_table`: `delivered_at`,
  `read_at` (timestamp nullable). Casts en `WhatsAppMessage`.
- `WhatsAppWebhookController::applyDeliveryStatus` — al avanzar a `delivered` setear `delivered_at`; a `read`
  setear `read_at` (y `delivered_at` si estaba null). Fecha = `status.timestamp` (unix de Meta), fallback `now()`.
- `WhatsAppMessageController::index` — sumar filtros: `exact('receipt_id')`, `callback('q')` (LIKE en
  `recipient_name` o `recipient_phone`), `callback('from')`/`callback('to')` (`whereDate created_at >= / <=`).
  Ya existen `type` y `status`.
- `WhatsAppMessageResource` — exponer `delivered_at`, `read_at`.
- Pest: webhook guarda los timestamps; index filtra por `q`, rango y `receipt_id`.

### 2. Frontend (apps/web/src/features)
- **Recordatorio de pago** (`whatsapp/PaymentReminderTab.tsx`): input "Buscar inquilino…"; grilla
  `sm:grid-cols-2` → izquierda **Inquilinos (N)** una columna, orden alfabético (`localeCompare('es')`),
  filtrada por el buscador (nombre o teléfono), con checkbox + "sin recibo"; derecha **Seleccionados (N)**
  uno abajo del otro con botón ✕ (aria-label "Quitar X"). Los 3 botones de selección quedan.
- **Tilde** (`receipts/SentMark.tsx`): queda decorativo (sin `title`). El hover lo da el `Tooltip` que ya
  tienen los botones Recibo/Rendición en `columns.tsx`: su contenido pasa de "Recibo" a
  "Recibo · WhatsApp: Entregado (enviado 15/11 17:03)". Las fechas completas viven en el detalle del recibo.
  El index de recibos no trae entregado/leído por fila (evita más subqueries); el detalle sí.
- **Leyenda** bajo la tabla de recibos (`receipts/ReceiptsPage.tsx`): línea chica
  "WhatsApp: ● Enviado ● Entregado/Leído ● Falló" reusando los colores de `SentMark`.
- **Detalle del recibo** (`receipts/ReceiptDetailDialog.tsx`): sección "Envíos por WhatsApp" con los mensajes
  del recibo (`listMessages` con `filter[receipt_id]`): tipo, destinatario, badge de estado, enviado/entregado/
  leído con fecha y hora, motivo si falló. Vacío → "Todavía no se envió por WhatsApp."
- **Historial** (`whatsapp/MessageHistory.tsx` + `api.ts`/`queries.ts`): barra de filtros — buscador (debounced,
  `use-debounced-value` existente), desde/hasta (`<input type="date">`), select tipo, select estado; los params
  van a `listMessages` y a la query key. El detalle del mensaje muestra entregado/leído con hora.
  `StatusBadge` → mover a `whatsapp/StatusBadge.tsx` para reusarlo en el detalle del recibo.
- Tipos: `WhatsAppMessage` += `receipt_id`, `delivered_at`, `read_at`.
- Vitest: buscador + panel de seleccionados (quitar con ✕ baja el contador); historial manda los filtros
  (MSW lee los params); detalle del recibo lista sus envíos.

### 3. Docs
- Spec de sub-N: agregar sección "Ampliación 2026-11-15" (no se edita lo aprobado, se suma).
- Plan `docs/plans/sub-N-usabilidad-plan.md`: pasos 10–13 para esta ampliación.

### Sin cambios respecto de antes
- `.htaccess` 302 del legacy: cuando el usuario pase el repo; se sube con el dump final.
- Suscribir campo `messages` en Meta: post-deploy.

### Verificación
- `docker compose exec php-fpm ./vendor/bin/pest`, `docker compose exec node-dev pnpm test` + `pnpm exec eslint`
  sobre las features tocadas (el lint global ya fallaba por `UserFormDialog.tsx`; el test de mantenimiento ya
  fallaba antes — no son de esta fase).
- `docker compose exec php-fpm php artisan migrate`.
- Local `http://localhost:8080`: hover del tilde muestra fechas; leyenda visible; detalle del recibo #45 lista
  sus envíos; Recordatorios → buscar "Ali" filtra, panel derecho lista seleccionados y la ✕ los quita;
  Historial filtra por nombre, fechas, tipo y estado.
- Guía de QA manual actualizada + mensaje de commit sugerido tras el OK del usuario.
