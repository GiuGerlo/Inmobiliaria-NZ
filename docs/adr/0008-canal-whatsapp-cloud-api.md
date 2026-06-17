# 0008 — Canal de envío por WhatsApp: Cloud API oficial (Meta)

- **Estado**: aceptada
- **Fecha**: 2026-06-17
- **Sub-proyecto**: I

## Contexto

Sub-I agrega el envío de recibos (al inquilino) y rendiciones (al dueño) por WhatsApp desde el admin.
Hoy el operador descarga el PDF y lo reenvía a mano. Hay que elegir **cómo** la app entrega el PDF por
WhatsApp. La decisión define toda la arquitectura de la fase (auth, costo, riesgo, infra).

## Opciones consideradas

### A — WhatsApp Cloud API oficial (Meta)

- **Pros**: canal oficial; adjunta el PDF como documento; no banean el número; entorno de prueba gratis
  (número de prueba + token temporal + 5 destinatarios verificados). Costo bajo por conversación en prod.
  Integración por HTTP simple (subir media → mensaje de plantilla).
- **Contras**: requiere cuenta de WhatsApp Business + número verificado + **plantillas aprobadas** (los
  envíos proactivos fuera de la ventana de 24 h exigen plantilla de cuerpo fijo).

### B — Link `wa.me` con texto prearmado

- **Pros**: gratis, cero setup.
- **Contras**: **no adjunta archivos** → el operador seguiría mandando el PDF a mano. Resuelve a medias.

### C — Proveedor BSP de pago (Twilio / 360dialog)

- **Pros**: API más simple sobre la oficial, onboarding rápido.
- **Contras**: costo mensual fijo + por mensaje; intermediario extra para una inmobiliaria chica.

### D — Librería no oficial (Baileys / whatsapp-web.js)

- **Pros**: gratis, adjunta PDFs, usa un número personal.
- **Contras**: **riesgo real de baneo** del número por Meta; sesión Node persistente que mantener. No apto
  para uso productivo serio.

## Decisión

**Opción A — Cloud API oficial.** Es la única que adjunta el PDF de forma confiable y sin riesgo de baneo,
con un entorno de prueba gratis para validar antes de producción. El costo es marginal para el volumen.

## Consecuencias

- Hay que crear y aprobar **2 plantillas** en Meta (recibo, rendición) con *document header*, categoría
  *utility*. El cuerpo es fijo; solo se rellenan variables (`nombre`, `mes`, `año`). El texto no se edita
  por envío.
- Secretos (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, nombres de plantilla) en `.env`, nunca
  commiteados. Para prod hace falta un **token permanente** (System User), no el temporal de 24 h.
- Envío **encolado** (job `SendWhatsAppDocument`). Por ahora cola `sync` (sin worker); en prod (sub-H) se
  flipea a `database` + `queue:work`.
- Teléfonos legacy se normalizan a E.164 con `propaganistas/laravel-phone`. Pendiente de confirmar
  empíricamente el caso del "9" de celular AR contra el número de prueba de Meta.
- Estado de entrega/lectura (webhook) queda **fuera de alcance**; el MVP registra "enviado" + message id.
