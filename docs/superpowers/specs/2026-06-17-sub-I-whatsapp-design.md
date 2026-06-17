# Sub-I — Envío por WhatsApp — Design

- **Fecha**: 2026-06-17
- **Estado**: aprobado
- **Depende de**: sub-F (generadores de PDF de recibo y rendición), sub-E (frontend core, `features/receipts/`), sub-D (modelos Contract/Receipt + tels).

## Problema

Hoy el flujo es manual: el operador genera el PDF del recibo (o la rendición), lo **descarga** y lo
**reenvía a mano** por WhatsApp a cada inquilino/dueño. Es repetitivo y propenso a olvidos. Los PDFs
ya existen (sub-F); falta el **canal de envío** integrado en el admin.

## Objetivo

Mandar **recibos a inquilinos** y **rendiciones a dueños** por WhatsApp con un botón desde la app,
adjuntando el PDF ya generado. Canal: **WhatsApp Cloud API oficial de Meta** (ADR-0008). El listado
mensual de pagos **queda fuera** (es reporte interno, sin destinatario externo claro).

## Decisiones (acordadas con el usuario)

1. **Canal**: Cloud API oficial. Descartados wa.me (no adjunta), BSP de pago (costo), y librerías no
   oficiales tipo Baileys (riesgo de baneo).
2. **Destinatarios**: recibo → inquilino del contrato; rendición → dueño de la propiedad.
3. **Plantillas (templates) con cuerpo FIJO + variables.** Meta exige plantilla aprobada para envíos
   proactivos fuera de la ventana de 24 h. El PDF va en el **header de documento** de la plantilla;
   las variables (`{{nombre}}`, `{{mes}}`, `{{año}}`) se autocompletan de los datos. **No se edita el
   texto por envío** (Meta lo bloquea) — se descartó la opción de cuerpo 100 % libre por riesgo de
   rechazo de la plantilla. Dos plantillas a aprobar en Meta: una recibo, una rendición.
4. **Teléfono**: se prellena el de la ficha (`Tel_Inquilino` / `Tel_Dueno`) normalizado a E.164 y
   **es editable en el modal** antes de enviar.
5. **Historial**: se registra cada envío en DB **y** se muestra una marca "enviado el DD/MM" en la
   fila del recibo. Evita doble envío y deja rastro de fallos.
6. **Envío encolado** (no bloquea el request). Cola **database** (la tabla `jobs` ya existe; sin
   Redis/Horizon).

## Plantillas (borradores, se cargan en Meta)

- **Recibo → inquilino**: "Hola {{nombre}}, te enviamos el recibo de alquiler de {{mes}}/{{año}}.
  Ante cualquier consulta quedamos a disposición. Inmobiliaria NZ."
- **Rendición → dueño**: "Hola {{nombre}}, adjuntamos la rendición de {{mes}}/{{año}} de tu
  propiedad. Saludos, Inmobiliaria NZ."

Categoría *utility*. El PDF se adjunta como header tipo `document`.

## Arquitectura

**Backend**

- `App\Services\WhatsAppClient` (HTTP facade contra Graph API). Métodos: `uploadMedia(string $path,
  string $mime): string` (devuelve `media_id`) y `sendTemplateDocument(string $to, string $template,
  string $mediaId, string $filename, array $vars): string` (devuelve `meta_message_id`). Config en
  `config/services.php` (`whatsapp.token`, `phone_number_id`, `api_version`), secretos en `.env` /
  `.env.example` (vacíos). Subir el media (no `document.link`) porque los PDF están detrás de auth.
- Job `SendWhatsAppDocument` (cola `database`, 3 reintentos + backoff). Toma/genera el PDF reusando
  los generadores de sub-F (los mismos que alimentan los botones PDF de recibo y rendición), sube el
  media, manda la plantilla, y persiste el resultado (estado `sent` + `meta_message_id`, o `failed` +
  error).
- **Normalización E.164**: helper que convierte el tel legacy a formato internacional (AR: prefijo
  `+54 9` para celular — el "9" es el caso borde). Si no valida → no se encola, error 422. La lib vs
  reglas a mano se decide en el plan (candidato: `propaganistas/laravel-phone` sobre libphonenumber).
- **Endpoints** (bajo `auth:sanctum` + Policy + FormRequest). Ambos PDFs salen del mismo `Receipt`
  (`ReceiptPdfController::receipt()` y `::settlement()`), así que ambos cuelgan del recibo:
  - `POST /api/v1/receipts/{receipt}/whatsapp` con body `{ type: 'recibo'|'rendicion', phone? }`.
  - `recibo` → inquilino (`tenant.Tel_Inquilino`); `rendicion` → dueño (`owner.Tel_Dueno`).
  - Body acepta override opcional de teléfono; el FormRequest lo valida.
- **Tabla `whatsapp_messages`** (migración nueva): `id`, `type` (`recibo|rendicion`),
  `recipient_phone`, `receipt_id?` / `contract_id?` + `period` (mes/año para rendición),
  `meta_message_id?`, `status` (`queued|sent|failed`), `error?`, `sent_at?`, `user_id`, timestamps.
- La marca en la UI: el Resource del listado de recibos expone `whatsapp_sent_at` (último envío
  exitoso del recibo) vía relación/subquery.

**Frontend** (`features/receipts/`, reusando patrones existentes)

- Botón-ícono WhatsApp en la fila de recibos (junto a detalle + PDFs) y donde hoy se dispara el PDF
  de rendición.
- **Modal de confirmación**: nombre del destinatario, input de teléfono prellenado y editable,
  preview del texto de la plantilla con variables resueltas, nombre del PDF. Botón "Enviar".
- Mutation react-query → al éxito invalida la lista (aparece la marca "enviado el DD/MM") + toast.

## Manejo de errores

- **Teléfono inválido o ausente** → 422 con mensaje claro; no se encola.
- **Falla de Meta** (token vencido, plantilla no aprobada, número inexistente en WhatsApp) → el job
  marca `failed` y guarda el error; la UI muestra el fallo y ofrece reintentar. Reintentos
  automáticos del job para fallos transitorios.
- **401** sin sesión → guard del front + endpoint 401.
- Logs **sin** token ni teléfono/PII en claro.

## Seguridad

- Token de WhatsApp solo en `.env`; `.env.example` con la clave vacía (nunca commitear el valor).
- Validación server-side (FormRequest) + Policy por modelo en cada endpoint.
- Rate limit en los endpoints de envío (evitar spam accidental / abuso).

## Testing

- **Pest** (`Http::fake()`, sin pegar a Meta): valida el payload de `uploadMedia` y de la plantilla;
  normalización AR (celular válido vs número inválido → 422); registro correcto en
  `whatsapp_messages`; auth + policy; manejo de fallo de Meta (estado `failed`).
- **Vitest**: el botón abre el modal; la mutation pega al endpoint correcto; la marca aparece tras el
  éxito.

## Fuera de alcance

- Listado mensual por WhatsApp.
- Estado de entrega/lectura (delivered/read) vía webhook — diferido (requiere endpoint público de
  webhook). MVP registra solo "enviado" + `meta_message_id`.
- Recordatorios automáticos de vencimiento/recibos pendientes → es **sub-J** (reusa este canal).
- Token permanente de System User y aprobación de plantillas: setup manual en Meta (lo hace el
  usuario), fuera del código.
