# Sub-C — Auth moderna (design spec)

- **Sub-proyecto**: C
- **Fecha**: 2026-06-09
- **Estado**: aprobado
- **Branch**: `fase/C-auth`
- **Depende de**: sub-B (DONE)

## Contexto

El login legacy (`legacy/loginauth.php`) compara `md5($_POST['password'])` contra `users.Pass_User` con SQL concatenado. Sub-C lo reemplaza en la API Laravel con auth moderna: Sanctum cookie-based para la SPA, bcrypt, rate limiting, perfil de usuario y migración transparente de la credencial MD5 existente.

El legacy sigue en producción usando `Pass_User` — nada de esta fase lo rompe.

Sub-B ya dejó la base lista: tabla `users` híbrida (`Pass_User` MD5 + `password` bcrypt nullable + `remember_token`), tablas `sessions` / `password_reset_tokens`, y modelo `User` con `$primaryKey = 'ID_User'`, cast `hashed` y `$hidden` correcto.

## Decisiones de esta fase

| # | Decisión | Razón |
|---|---|---|
| 1 | Migración MD5 → bcrypt por **rehash transparente al login** | Cero fricción; un solo usuario real; el código de transición se borra cuando muera el legacy. |
| 2 | `Pass_User` **queda intacta** post-rehash | El legacy en producción sigue logueando contra ella. Se elimina la columna recién en la fase de deprecación del legacy. |
| 3 | **Controllers propios** sobre Sanctum (no Fortify, no custom UserProvider) | 5 endpoints no justifican framework extra; rutas `/api/v1` según api-conventions.md; el rehash queda visible y fácil de borrar. |
| 4 | Roles/permisos **diferidos a sub-G** | Un solo usuario admin hoy. YAGNI. spatie/laravel-permission se evalúa cuando haya features multi-usuario. |
| 5 | Forgot password **diferido** | Requiere SMTP que no está configurado; el rehash cubre la migración del usuario actual. |
| 6 | Remember me: **sí** | Columna `remember_token` ya existe; UX de uso diario. |
| 7 | Sesión en driver **database** | Tabla `sessions` ya creada en sub-B; revocable y consultable. |

## Arquitectura

- **Sanctum stateful SPA**: `$middleware->statefulApi()` en `bootstrap/app.php`.
- Mismo dominio vía nginx (`localhost:8080`: `/` → Vite, `/api` → Laravel) → cookies first-party, sin CORS cross-origin.
- Cookies: `HttpOnly`, `SameSite=Lax`, `Secure` en prod.
- CSRF: la SPA hace `GET /sanctum/csrf-cookie` antes de login; mutaciones llevan `X-XSRF-TOKEN`.
- `SANCTUM_STATEFUL_DOMAINS` incluye `localhost:8080`.
- `Cache-Control: no-store` en responses autenticadas (PII — regla api-conventions.md).

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/login` | guest | email + password + remember. Rate limit 5/min por email+IP. |
| POST | `/api/v1/auth/logout` | `auth:sanctum` | Invalida sesión, regenera token CSRF. |
| GET | `/api/v1/me` | `auth:sanctum` | Usuario actual (`UserResource`). |
| PATCH | `/api/v1/me` | `auth:sanctum` | Edita `Nombre_User`, `Email_User` (unique ignorando propio ID). |
| PUT | `/api/v1/me/password` | `auth:sanctum` | Cambia password; requiere password actual. |

Validación por Form Request, responses por `UserResource` (nunca model crudo). Mensajes de error en español.

## Flujo de login + rehash MD5 (transitorio)

```
LoginRequest valida (email requerido+formato, password requerido)
→ RateLimiter::tooManyAttempts("login:{email}|{ip}", 5) → 429 + Retry-After
→ Auth::attempt([email, password], remember)
   → falla y user existe y user->password === null:
       hash_equals(user->Pass_User, md5(input))
       → match: user->password = input (cast hashed la bcryptea), save,
                Auth::login(user, remember)
→ éxito: session()->regenerate() + RateLimiter::clear + 200 UserResource
→ falla:  RateLimiter::hit + 422 "Las credenciales no coinciden" (genérico,
          no revela si el email existe)
```

- Rehash aislado en método privado del `AuthController`, comentado como transitorio: **borrar cuando el legacy muera**.
- `Pass_User` no se toca.
- Usuario ya migrado (`password` bcrypt seteado) nunca cae al fallback MD5.

## Perfil

- `PATCH /me`: `Nombre_User` (requerido, max 100), `Email_User` (requerido, email, max 100, `unique:users,Email_User` ignorando el propio `ID_User`).
- `PUT /me/password`: rule `current_password`, password nuevo min 8 + confirmación. Post-cambio: `session()->regenerate()` (regla 8 de security.md).

## Archivos nuevos (`apps/api/`)

```
app/Http/Controllers/Api/V1/AuthController.php      login, logout
app/Http/Controllers/Api/V1/ProfileController.php   show, update, updatePassword
app/Http/Requests/LoginRequest.php
app/Http/Requests/UpdateProfileRequest.php
app/Http/Requests/UpdatePasswordRequest.php
app/Http/Resources/UserResource.php
tests/Feature/Auth/LoginTest.php
tests/Feature/Auth/LogoutTest.php
tests/Feature/Auth/ProfileTest.php
tests/Feature/Auth/PasswordTest.php
```

Config: `bootstrap/app.php` (+`statefulApi()`), `.env`/`config/session.php` (driver `database`), `SANCTUM_STATEFUL_DOMAINS`.

## Tests de la fase (DoD)

- [ ] Login OK → 200, cookie de sesión, shape `UserResource`.
- [ ] Password incorrecto → 422 genérico (mismo mensaje exista o no el email).
- [ ] Rate limit: 6º intento en el minuto → 429 con `Retry-After`.
- [ ] **Rehash**: user con `Pass_User = md5(x)` y `password = null` → login con `x` → 200, `password` bcrypt válido, `Pass_User` intacta.
- [ ] User ya migrado loguea por bcrypt; con `password` seteado no hay fallback MD5.
- [ ] Logout → 204, sesión invalidada (request siguiente → 401).
- [ ] `GET /me` sin sesión → 401; con sesión → datos correctos.
- [ ] `PATCH /me` OK; email duplicado → 422; propio email sin cambio → OK.
- [ ] `PUT /me/password` OK + relogin con nueva; password actual incorrecta → 422.
- [ ] Suite completa verde: `docker compose exec php-fpm ./vendor/bin/pest`.
- [ ] Cobertura auth ≥ 80% (objetivo testing.md para features críticos).

## Fuera de scope

- Frontend de login (sub-E).
- Roles/permisos (sub-G).
- Forgot/reset password por email (cuando haya SMTP).
- Eliminar `Pass_User` / `loginauth.php` legacy (fase de deprecación).
- 2FA.

## Riesgos

- **Dev y legacy comparten DB**: el rehash escribe `password` pero nunca `Pass_User` — el login legacy sigue funcionando con la misma fila.
- **Lockout por rate limit** (5/min): clave compuesta email+IP limita el daño; expira en 60s.
- **Sesiones stateful en API**: requiere que la SPA respete el flujo csrf-cookie; documentado acá y en el plan para sub-E.

## Referencias

- Reglas: `.claude/rules/security.md`, `.claude/rules/api-conventions.md`.
- Legacy: `legacy/loginauth.php`.
- Roadmap: `docs/roadmap.md`.
