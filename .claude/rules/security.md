# Seguridad

## Principios obligatorios

1. **Prepared statements siempre.** Cero concatenación de SQL. Laravel Eloquent / Query Builder por default.
2. **CSRF** en todas las mutaciones (POST/PUT/PATCH/DELETE). Sanctum lo provee para SPA.
3. **Validación en servidor** via FormRequest. La validación cliente es UX, no seguridad.
4. **Escape de salida** automático con Blade `{{ }}` y JSX (no `{!! !!}` ni `dangerouslySetInnerHTML` sin sanitización).
5. **Passwords**: hash con `bcrypt` (default Laravel) o `argon2id`. Nunca MD5/SHA1.
6. **Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP (afinar en sub-E).
7. **Cookies**: `HttpOnly`, `Secure` (prod), `SameSite=Lax` o `Strict`.
8. **Session regenerate** post-login y post-cambio de password.
9. **Rate limiting** en endpoints sensibles (`login`, `password reset`). Laravel built-in.
10. **Uploads**: validar mime real con `finfo`, tamaño, dimensiones; nunca confiar en extensión ni en `mime_content_type`.

## `.env` y secretos

- `.env` jamás se commitea. `.env.example` sí (sin valores reales).
- Credenciales rotables al sospechar exposición (el actual repo tiene la contraseña de prod en `includes/conexion.php` — **rotar en fase 0**).
- Para CI/CD: variables en GitHub Actions Secrets o entorno del runner.

## Migración del legacy

- Usuarios MD5 existentes (`users.Pass_User`) → al login exitoso comparar contra hash MD5 una sola vez, luego rehashear con bcrypt y guardar. O forzar password reset por email en sub-C.
- Datos de inquilinos/dueños son PII → ningún seed/factory con datos reales en repo.

## Audit checklist (ejecutar al cerrar cada fase)

Skill `/security-review` sobre el branch.

- [ ] Sin secrets en código ni commits.
- [ ] Sin SQL concatenado.
- [ ] Validación server-side en cada endpoint nuevo.
- [ ] Auth + authorization (policies) en cada endpoint nuevo.
- [ ] Rate limit en endpoints públicos sensibles.
- [ ] Headers configurados.
- [ ] Logs no contienen passwords / tokens / PII.
