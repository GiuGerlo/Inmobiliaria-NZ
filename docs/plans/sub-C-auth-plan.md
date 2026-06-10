# Plan — Sub-C — Auth moderna (Sanctum SPA)

> Fuente: `docs/superpowers/specs/2026-06-09-sub-C-auth-design.md` (aprobado 2026-06-09).
> Branch: `fase/C-auth`.

## Pasos

### Step 1 — Config Sanctum stateful + sesión
- [x] `bootstrap/app.php`: `$middleware->statefulApi()`.
- [x] `.env` + `.env.example`: `SESSION_DRIVER=database` (SANCTUM_STATEFUL_DOMAINS y SESSION_DOMAIN ya estaban).
- [x] Cookies `HttpOnly`, `SameSite=Lax` verificadas (default de `config/session.php`).
- [x] `GET /sanctum/csrf-cookie` → 204 con cookies XSRF + sesión. Requirió nueva location `/sanctum/` en `docker/nginx/nginx.conf` (rebuild de imagen nginx).
- [x] Sesión persiste en tabla `sessions`.

### Step 2 — UserResource + Form Requests
- [x] `UserResource`: `id`, `name`, `email` (mapea ID_User/Nombre_User/Email_User).
- [x] `LoginRequest`, `UpdateProfileRequest` (unique ignorando propio ID), `UpdatePasswordRequest` (`current_password`, min 8, confirmed).
- [x] Mensajes de validación en español.

### Step 3 — AuthController (login/logout + rehash MD5)
- [x] Login: RateLimiter 5/min `login:{email}|{ip}` → 429 + Retry-After; `Auth::attempt`; fallback MD5 transitorio (`hash_equals` + set bcrypt + `Auth::login`); `session()->regenerate()` + clear limiter; falla → 422 genérico.
- [x] Rehash aislado en `attemptLegacyMd5()` privado, comentado como transitorio. `Pass_User` intacta.
- [x] Logout: invalidate + regenerateToken → 204.
- [x] Rutas `/api/v1/auth/*` registradas.

### Step 4 — ProfileController
- [x] `GET /me`, `PATCH /me`, `PUT /me/password` (con regenerate post-cambio).
- [x] Mejora post security-review: cambio de password borra las demás sesiones del usuario en `sessions`.
- [x] Middleware `NoStoreHeaders` (`no-store` + `nosniff`) en grupo autenticado.

### Step 5 — Tests Pest (Feature/Auth)
- [x] `LoginTest` (7): OK, password mal, email inexistente mismo mensaje, rate limit 429, rehash MD5 con Pass_User intacta, sin fallback post-migración, remember cookie.
- [x] `LogoutTest` (2), `ProfileTest` (5), `PasswordTest` (4).
- [x] Suite completa: **29 passed (99 assertions)**.

### Step 6 — Verificación E2E + calidad
- [x] `pint` limpio (1 issue auto-fix en UserResource).
- [x] Curl E2E real: csrf-cookie → login usuario legacy MD5 (rehash verificado en DB: bcrypt seteado, MD5 intacta) → me → patch → password → logout → 401. Usuario temporal borrado.
- [x] `/security-review`: sin hallazgos reportables. Único candidato (sesiones no invalidadas en cambio de password) clasificado hardening — corregido igual.

### Step 7 — Docs + cierre
- [x] `docs/roadmap.md`: sub-C DONE, sub-D siguiente.
- [x] `docs/changelog.md`: entrada sub-C.
- [x] Este plan DONE.
- [x] Commit sugerido: `feat(auth): sanctum login + rate limit + perfil`.

## Verificación ejecutada (2026-06-09)

```
pest                 → 29 passed (99 assertions)
pint --test          → 67 files PASS
curl E2E             → login MD5 rehash OK / me OK / patch OK / password OK / logout OK / me post-logout 401
security-review      → 0 hallazgos (1 hardening aplicado)
```

## Fuera de scope (recordatorio)

Frontend login (sub-E), roles (sub-G), forgot password (sin SMTP), borrar `Pass_User`/legacy.

> ✅ DONE — 2026-06-09.
