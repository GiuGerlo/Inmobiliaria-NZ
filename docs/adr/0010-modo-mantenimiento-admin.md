# 0010 — Modo mantenimiento desde el admin (toggle + allowlist por IP)

- **Estado**: aceptada
- **Fecha**: 2026-07-02
- **Contexto**: El mantenimiento manual se operaba **por SSH**: en el admin `php artisan down --secret`
  y en el público `touch maintenance.on` + link secreto `/__open/<MAINT_SECRET>` (cookie de bypass). Es
  engorroso y propenso a error para la dueña/superadmin. Se quiere un **toggle desde el admin** que solo
  el superadmin active/desactive, que bloquee **el sitio público y el admin** dejando entrar **solo su
  IP** (capturada al activar). Restricción clave: el público es **Next static export** (sin runtime en
  Hostinger), pero admin (Laravel) y público comparten **cuenta/filesystem** en Hostinger.
- **Opciones consideradas**:
  - **A — Laravel escribe el gate en el `.htaccess` del público (IP baked) + middleware en el admin.**
    LiteSpeed sirve la IP permitida directo; el resto ve `maintenance.html`. Pro: sin PHP en el público,
    rápido. Con: el admin escribe fuera de `storage/` (acotado por config).
  - **B — Mini gate PHP en el público que lee la IP de un archivo.** Con: servir el sitio real a la IP
    permitida a través de PHP es engorroso (content-types, index); mete PHP en un sitio "estático".
  - **C — Mantener el método por secreto/SSH.** Es justo lo que se quiere reemplazar.
- **Decisión**: **A**. Estado (on/off + IP permitida) en tabla `settings` (modelo `Setting`, helper
  `MaintenanceState`). Middleware **`MaintenanceGate`** en el grupo `auth:sanctum` del admin: bloquea
  (503) salvo (IP permitida) **OR** (superadmin logueado); `login`/`me`/`logout`/`maintenance/status`
  siempre accesibles → nunca te bloqueás a vos mismo. Servicio **`PublicMaintenanceGate`** escribe/quita
  un bloque delimitado `# BEGIN NZ-MAINTENANCE … # END` en el `.htaccess` del docroot público
  (`PUBLIC_DOCROOT_PATH`); no-op si no está configurado (ej. local). La IP sale de `$request->ip()`
  (= `REMOTE_ADDR`, sin trusted proxies) para keyear **la misma noción de IP** que el `%{REMOTE_ADDR}`
  del `.htaccess`. La IP nunca viene de input del usuario → sin inyección.
- **Consecuencias**:
  - Se **borra el método por secreto**: `MAINT_SECRET` (GitHub secret + inyección `sed` en
    `deploy-public`), `/__open`, cookie `nz_maint_bypass`, `artisan down --secret` manual. El down/up
    **automático del deploy** (durante migraciones) **queda** (es otra cosa).
  - Un **deploy del público** reescribe el `.htaccess` base → **apaga** el mantenimiento del público
    (re-activar desde el admin si hace falta).
  - Requiere `PUBLIC_DOCROOT_PATH` en el `.env` del server; sin eso el toggle **solo bloquea el admin**.
  - **Validar en dev** que la IP capturada = IP pública real. Si Hostinger interpone un proxy, ajustar
    trusted-proxy/`X-Forwarded-For` en Laravel **y** el `RewriteCond` del `.htaccess` (misma IP en ambos).
  - Deuda: **1 sola IP** (no lista). Si la IP del superadmin cambia durante mantenimiento del público,
    re-capturar con "Actualizar a mi IP" desde el admin.
