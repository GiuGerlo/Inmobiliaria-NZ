# Plan — Sub-I: Envío por WhatsApp

> Spec: `docs/superpowers/specs/2026-06-17-sub-I-whatsapp-design.md`. Estado: **DONE 2026-06-17** (código + tests; branch `fase/I-whatsapp`). Pasos 0–8 completos, Pest 122 + Vitest 39 verdes. Pendiente del usuario: aprobar 2 plantillas en Meta + verificación de envío real (paso 9) + commit. Policy omitida a propósito: el proyecto no usa policies (rol admin único tras `auth:sanctum`).
> Una fase = un commit (lo hace Giuliano). Canal: WhatsApp Cloud API oficial (ADR-0008).
> Ambos PDFs (recibo + rendición) salen del mismo `Receipt` (`ReceiptPdfController::receipt()` /
> `::settlement()`). Fase 0 (setup Meta + prueba del canal gratis) ya validada por el usuario.

## 0. Config + dependencia

- `config/services.php`: bloque `whatsapp` → `token`, `phone_number_id`, `api_version` (default
  `v21.0`), `template_recibo`, `template_rendicion`.
- `.env` y `.env.example`: `WHATSAPP_TOKEN=`, `WHATSAPP_PHONE_NUMBER_ID=`, `WHATSAPP_API_VERSION=v21.0`,
  `WHATSAPP_TEMPLATE_RECIBO=`, `WHATSAPP_TEMPLATE_RENDICION=` (valores vacíos en `.example`).
- Cola: `QUEUE_CONNECTION=database` (la tabla `jobs` ya existe). Confirmar en `.env`.
- Dependencia teléfono: `composer require propaganistas/laravel-phone` (libphonenumber). *Ponytail:*
  número AR con el "9" de celular es borde real y un número mal = entrega fallida → vale la lib, no
  regex a mano.
- **Done**: `config('services.whatsapp')` resuelve; lib instalada.

## 1. Normalización de teléfono

- `app/Support/PhoneNumber.php`: `toE164(?string $raw, string $country = 'AR'): ?string` usando
  laravel-phone; devuelve `null` si no valida. Sin excepción — el caller decide el 422.
- **Done**: tinker — `+54 9 351 ...` y formatos legacy comunes → E.164; basura → null.

## 2. Refactor: extraer builder de PDF (DRY)

- `app/Support/ReceiptPdf.php`: `receipt(Receipt): PdfBuilder` y `settlement(Receipt): PdfBuilder`
  (mueve la construcción desde `ReceiptPdfController`, con `load(RELATIONS)` + `ReceiptCalculator` +
  `NumberToWords`).
- `ReceiptPdfController` pasa a usarlas (`->inline(...)`). El job usará `->save($tmpPath)`.
- **Done**: los 2 endpoints PDF existentes siguen devolviendo el mismo PDF (sin regresión).

## 3. DB: tabla + modelo whatsapp_messages

- Migración `create_whatsapp_messages_table`: `id`, `receipt_id` (FK), `type`
  (`recibo|rendicion`), `recipient_phone`, `meta_message_id` nullable, `status`
  (`queued|sent|failed`, default `queued`), `error` text nullable, `sent_at` nullable,
  `user_id` (FK), timestamps. Índice (`receipt_id`, `type`).
- `app/Models/WhatsAppMessage.php` + relación `Receipt::whatsappMessages()`.
- **Done**: `php artisan migrate` ok; modelo crea/lee.

## 4. Servicio WhatsAppClient

- `app/Services/WhatsAppClient.php` (HTTP facade, base `graph.facebook.com/{version}/{phone_id}`):
  - `uploadMedia(string $path, string $mime = 'application/pdf'): string` → POST `/media`
    (multipart `messaging_product=whatsapp`) → `media_id`.
  - `sendTemplateDocument(string $to, string $template, string $mediaId, string $filename, array $vars): string`
    → POST `/messages` type=template con header `document` (`id`=mediaId, filename) + body params
    (`vars`) → `meta_message_id`.
  - Lanza excepción con el cuerpo de error de Meta (sin loguear el token).
- **Done**: con `Http::fake()` arma los payloads esperados.

## 5. Job de envío

- `app/Jobs/SendWhatsAppDocument.php` (`ShouldQueue`, `tries=3`, backoff). Props: `WhatsAppMessage`.
  - Genera el PDF a un tmp (`ReceiptPdf::{type}()->save(tmp)`), `uploadMedia`, `sendTemplateDocument`
    con las variables (nombre destinatario, mes, año del recibo), borra el tmp.
  - Éxito → `status=sent`, `meta_message_id`, `sent_at`. `failed()` → `status=failed` + `error`.
- **Done**: feature test (fake) crea el registro `sent` y arma el payload; fallo → `failed`.

## 6. Endpoint + request + policy

- `app/Http/Requests/Receipt/SendWhatsAppRequest.php`: `type` in `recibo,rendicion`; `phone` nullable
  (override) → en `prepareForValidation` normaliza con `PhoneNumber::toE164`; si el resultante es
  null → falla validación (422 claro).
- `app/Http/Controllers/Api/V1/ReceiptWhatsAppController.php` (invokable): resuelve destinatario
  (recibo→`tenant.Tel_Inquilino`, rendicion→`owner.Tel_Dueno`) salvo override; crea `WhatsAppMessage`
  `queued`; dispatch del job; devuelve 202 con el registro.
- `routes/api.php`: `POST receipts/{receipt}/whatsapp` en grupo `auth:sanctum` + throttle.
- `ReceiptPolicy` (o gate existente) cubre la acción.
- `ReceiptResource`: agrega `whatsapp_sent_at` (último `sent` por tipo, o el más reciente) para la
  marca en la tabla. *Ponytail:* subquery simple, no N+1.
- **Done**: `POST .../whatsapp` 202 autenticado, 422 con tel inválido, 401 sin sesión, encola el job.

## 7. Frontend

- `features/receipts/api.ts` + `queries.ts`: `sendReceiptWhatsApp(receiptId, {type, phone?})` +
  `useSendWhatsApp()` (invalida la lista de recibos al éxito).
- Botón-ícono WhatsApp en la fila de la tabla de recibos (junto a detalle + PDFs) con menú/2 acciones
  (recibo a inquilino / rendición a dueño) — o dos íconos.
- `SendWhatsAppDialog.tsx`: muestra destinatario + input teléfono prellenado/editable + preview del
  texto + nombre del PDF. Confirmar → mutation → toast.
- Marca "enviado el DD/MM" en la fila usando `whatsapp_sent_at`.
- **Done**: desde la UI se dispara el envío, aparece toast y la marca tras refetch.

## 8. Tests

- Pest: `WhatsAppClientTest` (payloads con fake), `SendWhatsAppDocumentTest` (sent/failed),
  `ReceiptWhatsAppTest` (202/422/401 + policy), `PhoneNumberTest` (AR ok/borde/inválido).
- Vitest: `SendWhatsAppDialog.test.tsx` (abre, mutation correcta, marca tras éxito) con MSW.
- **Done**: `pest` + `pnpm test` verdes, sin regresión en los PDF existentes.

## 9. Verificación real (con número de prueba de Meta)

- Cargar token temporal + phone_number_id de prueba en `.env`; aprobar/usar plantillas de prueba.
- Generar un recibo → botón WhatsApp → confirmar que llega el PDF al celular verificado.
- Repetir con rendición.

## 10. Cierre

- `/security-review` del branch (token fuera de logs, validación, policy, rate limit).
- `docs/changelog.md` + `docs/roadmap.md` (sub-I DONE) + este plan DONE.
- ADR-0008 (canal WhatsApp) escrito en `docs/adr/`.
- Sugerir commit (caveman-commit). El commit lo hace Giuliano.
