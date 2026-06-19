# Docker — nz-estudio

Entorno de desarrollo local con Docker. Reemplazo total de Laragon.

## Stack

| Servicio | Imagen | Puerto host | Notas |
|---|---|---|---|
| `web` | `php:8.2.30-apache` (build local) | `8080` → `80` | Apache + PHP 8.2.30, mod_rewrite, gd con WebP, mysqli |
| `db` | `mariadb:11.8.6` | `3307` → `3306` | Paridad con Hostinger. Auto-import del dump en primer boot |
| `phpmyadmin` | `phpmyadmin:5.2` | `8081` → `80` | Login auto con `nz` / `nzdev` |

Red interna: `nz_net` (bridge). Los servicios se resuelven por nombre (`db`, `web`).

## Quickstart

```bash
# 1. Configurar variables
cp .env.example .env

# 2. Levantar todo
docker compose up -d --build

# 3. Abrir en el navegador
#    http://localhost:8080         → sitio
#    http://localhost:8081         → phpMyAdmin
```

Primer boot: la imagen MariaDB ejecuta `db/nzestudio.sql` desde `/docker-entrypoint-initdb.d/`. Tarda ~10-30s dependiendo del tamaño del dump. Los logs muestran `ready for connections` cuando termina.

## Credenciales por defecto (dev)

| Servicio | Usuario | Password |
|---|---|---|
| MariaDB | `nz` | `nzdev` |
| MariaDB root | `root` | `rootdev` |
| Admin del sitio | `ggiuliano526@gmail.com` | *(la del dump)* |

Sobreescribibles en `.env` (`DB_DOCKER_USER`, `DB_DOCKER_PASS`, `DB_DOCKER_ROOT_PASS`).

## Comandos comunes

```bash
# Ver logs en vivo
docker compose logs -f web
docker compose logs -f db

# Shell dentro del container web
docker compose exec web bash

# Cliente mysql directo
docker compose exec db mariadb -u nz -pnzdev nz-estudio

# Parar (los datos DB persisten en el volumen)
docker compose down

# Parar + borrar volumen DB (re-importa el dump al siguiente up)
docker compose down -v

# Rebuild forzado de la imagen web (cuando tocás el Dockerfile o php.ini)
docker compose build --no-cache web
docker compose up -d web

# Status
docker compose ps
```

## Volúmenes y persistencia

- **`nz_db_data`** (named volume) — datos de MariaDB. Sobreviven `docker compose down`. Se borran con `docker compose down -v`.
- **`./` → `/var/www/html`** (bind mount) — el repo entero. Editás en el host, los cambios se reflejan al instante en el container. Incluye `uploads/`, por lo que las imágenes subidas desde admin aparecen en `uploads/propiedades/...` del host.

## Bind mount en Windows — performance

Si el repo vive en `C:\laragon\www\nz-estudio\` (NTFS) y Docker Desktop usa el backend **WSL2**, los reads del bind mount cruzan el límite NTFS↔ext4 y son notablemente más lentos que un repo nativo en WSL2.

Opciones (de menor a mayor cambio):
1. **Aceptar y seguir** — para este proyecto (PHP procedural, sin watcher pesado, sin npm), la diferencia suele ser tolerable.
2. **Mover el repo a filesystem WSL2** — clonarlo en `\\wsl$\Ubuntu\home\<user>\nz-estudio\` y trabajar desde ahí (VS Code soporta `Remote-WSL`). 5-10× más rápido.
3. **No usar `:cached` / `:delegated`** — esos flags eran de macOS y no aplican a Windows.

## Permisos de archivos

- Dentro del container, Apache corre como `www-data`. El Dockerfile hace `chown www-data:www-data` sobre `uploads/`.
- En Windows (NTFS) no hay noción Unix de uid/gid en el host → no hay conflictos.
- En Linux/Mac, si Apache crea archivos en `uploads/` con uid 33 y vos sos uid 1000, no vas a poder borrarlos sin `sudo`. Soluciones:
  - `sudo chown -R $USER:$USER uploads/` ocasionalmente.
  - Build arg en Dockerfile para alinear UID (mejora opcional a futuro).

## Detección de entorno en `config/config.php`

El config detecta Docker así (en orden):

1. Si la env var `NZ_ENV=docker` está presente (el Dockerfile la setea) → entorno Docker.
2. Si `HTTP_HOST` contiene `:8080` → entorno Docker (fallback).
3. Si no, intenta Laragon (`localhost`, `.test`, `.local`).
4. Si no, asume producción.

Cada entorno lee su propio bloque de variables del `.env` (`DB_DOCKER_*`, `DB_LOCAL_*`, `DB_PROD_*`).

## Troubleshooting

### "Cannot connect to MariaDB" en el sitio
1. `docker compose ps` — ¿`db` está `healthy`?
2. `docker compose logs db` — buscar el primer arranque, errores de import del dump.
3. Si el dump quedó corrupto o cambió, `docker compose down -v` para reimportar limpio.

### "Port 8080 already in use"
Otra cosa está usando el puerto (probablemente Laragon corriendo en paralelo). Apagar Laragon o cambiar el puerto en `docker-compose.yml` (línea `"8080:80"` → `"8090:80"`).

### Cambios en `.env` no se reflejan
Las variables se leen al arrancar el container. Reiniciar: `docker compose up -d --force-recreate web`.

### Cambios en `php.ini` o `Dockerfile` no se reflejan
La imagen necesita rebuild: `docker compose build web && docker compose up -d web`.

### Phpmyadmin pide login
Las credenciales se inyectan vía env vars del compose; si el form aparece igual, ingresar `nz` / `nzdev` o `root` / `rootdev`.

### El dump no se importa
- El init-script solo corre cuando el volumen está vacío. Si ya tenés data, `docker compose down -v` y subir de nuevo.
- Verificar que `db/nzestudio.sql` existe y es válido (`head db/nzestudio.sql`).

## Lo que NO se sube a producción

El archivo `.deployignore` excluye explícitamente todo lo Docker:

```
docker/
docker-compose.yml
docker-compose.*.yml
.dockerignore
.docker-data/
db/
```

El workflow `.github/workflows/deploy.yml` lee `.deployignore` antes del rsync. Verificar antes de hacer push a `production` con:

```bash
git diff main..production --name-only | grep -E "^(docker|\.docker)"
# No debería devolver nada relacionado a Docker en el set de archivos efectivamente deployados.
```

## Migración desde Laragon

1. Parar Laragon completamente (Apache + MySQL stop desde la GUI).
2. Exportar la DB local si tenés cambios no commiteados (`mysqldump nz-estudio > db/nzestudio.sql`).
3. Verificar que el dump esté actualizado en `db/nzestudio.sql`.
4. `docker compose up -d --build`.
5. Revisar que `http://localhost:8080` muestre el sitio.
6. Una vez confirmado, Laragon se puede desinstalar.

## Próximos pasos

- Setup de **CI/CD con la misma imagen Docker** (build en GitHub Actions, push a registry, deploy a Hostinger por SSH). Pendiente; ahora el deploy sigue siendo rsync directo.
- Multi-stage build para una imagen de producción reducida si en el futuro Hostinger se reemplaza por VPS.
