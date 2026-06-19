# CLAUDE.md — nz-estudio

Brief de contexto para Claude. Sitio web del **Estudio Jurídico-Inmobiliario Nadina Zaranich** (Guatimozín, Córdoba). Catálogo público de propiedades + panel admin con CRUD + sección publicitaria de proyecto destacado (Capua de Edilizia). Desarrollado por **Giuliano Gerlo** ([giulianogerlo.vercel.app](https://giulianogerlo.vercel.app/)).

**Producción**: https://nz-estudiojuridicoinmobiliario.com/ (Hostinger).
**Repo**: GiuGerlo/nz-estudio. Branches: `main` (dev) · `production` (lo que está deployado).

## 1. Stack

- **PHP 8.2.12** procedural. Sin Composer. Sin framework.
- **MySQL/MariaDB** vía `mysqli` (NO PDO). Instancia global `$db` creada en `config/config.php`.
- **Frontend**: Bootstrap 5.3.2, Bootstrap Icons, AOS, SweetAlert2, jQuery 3.7, **GLightbox** (galería de Capua).
- **Admin**: DataTables 1.13.7 (jQuery), Font Awesome 6.4.2.
- **Mapas**: Google Maps API (iframe embeds + MarkerClusterer en `templates/map.php`).
- **Analytics**: GA4, ID `G-0CG4DEM9KS` (en `.env`).
- **Entorno local**: **Docker** (Apache + PHP 8.2.30 + MariaDB 11.8.6 + phpMyAdmin). Reemplaza a Laragon. Ver `docs/DOCKER.md`.
- **Producción**: Hostinger (shared hosting con SSH, `nz-estudiojuridicoinmobiliario.com`).
- **CI/CD**: GitHub Actions → SSH/rsync a Hostinger en push a `production`. Ver `docs/DEPLOY.md`.

## 2. Estructura

```
nz-estudio/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml         # Auto en push a production (5 etapas)
│   │   └── redeploy.yml       # Manual con inputs from_sha/to_sha/mode
│   └── scripts/deploy.sh      # Lógica modular --phase=config|read-sha|plan|execute|finalize
├── admin/                     # Panel admin (CRUD propiedades)
│   ├── admin.php              # Dashboard con stats
│   ├── propiedades.php        # CRUD con DataTables + modal
│   ├── categorias.php         # CRUD tipos de propiedad
│   ├── vendidas.php           # Vista propiedades vendidas
│   ├── order-propiedades.php  # Drag-drop reorden por categoría
│   ├── controllers/           # Lógica (controller_propiedades.php, controller_categorias.php)
│   ├── templates/             # modal_propiedad.php
│   └── includes/              # head.php (sidebar+navbar, guard sesión), footer.php
├── assets/
│   ├── css/  js/  scss/  vendor/    # Bootstrap, AOS, jQuery, php-email-form
│   └── img/
│       ├── logo-original.svg        # Logo Giuliano Gerlo (texto blanco, footer dark)
│       ├── logo-secundario.svg      # Logo Giuliano Gerlo (texto negro, footer claro)
│       └── capua/                   # Imágenes proyecto Capua (slide-*, complejo-*, transition-*, ubicacion)
├── config/
│   ├── env.php                # Loader propio de .env (sin Composer, sin parse_ini_file)
│   └── config.php             # Lee de env(), detecta local vs prod por HTTP_HOST
├── docs/
│   └── DEPLOY.md              # Documentación CI/CD completa
├── includes/
│   ├── head.php               # Header público, nav sticky, CDNs (Bootstrap + GLightbox CSS)
│   ├── head-meta.php          # Meta tags dinámicos SEO
│   └── footer.php             # Footer + scripts (GLightbox JS init)
├── templates/                 # Secciones reusables del home
│   ├── hero.php  about.php  capua.php  services.php  contact-me.php  map.php
├── uploads/propiedades/{categoria}/{id}/    # Imágenes WebP de propiedades (NO commitear)
│
├── index.php                  # Home: hero → about → capua → services → map → contact
├── propiedades.php            # Listado + filtros + buscador en vivo
├── propiedad.php              # Detalle (carousel imgs, info, relacionadas)
├── vendidas.php               # Archivo de vendidas
├── login.php  auth.php  logout.php  404.php
├── .deployignore              # Patrones excluidos del deploy
├── .env / .env.example        # Variables de entorno (.env NO commitear)
├── .htaccess                  # URLs amigables + deny .env
└── u407412506_nzestudio.sql   # Dump local (NO commitear)
```

## 3. Páginas públicas

| Archivo | Función | Auth |
|---|---|---|
| `index.php` | Home secciones | No |
| `propiedades.php` | Catálogo + filtros por categoría + búsqueda live | No |
| `propiedad.php?id=N` | Detalle de propiedad + 3 relacionadas | No |
| `vendidas.php` | Listado de vendidas | No |
| `login.php` | Form de admin | No |
| `auth.php` | POST endpoint, responde JSON | No |
| `logout.php` | Destruye sesión | Sí |
| `404.php` | Error (vía `.htaccess`) | No |

## 4. Panel admin (`admin/`)

- **Dashboard** `admin.php` — totales (propiedades, categorías, imágenes) + últimas 5.
- **Propiedades** `propiedades.php` — DataTables, modal AJAX para alta/edición, multi-upload de imágenes.
- **Categorías** `categorias.php` — CRUD tipos (con check de integridad referencial).
- **Vendidas** `vendidas.php` — marcar/desmarcar `vendida = 1`.
- **Orden** `order-propiedades.php` — drag-drop jQuery, actualiza campo `orden` por categoría.

Controllers en `admin/controllers/` reciben `$db` por constructor, devuelven arrays/JSON `['estado', 'mensaje', 'data']`. AJAX desde el frontend con `$.ajax` + `FormData` para uploads.

## 5. Base de datos

Database: `nz-estudio` (local) / `u407412506_nzestudio` (prod). Charset utf8mb4. Dump: `u407412506_nzestudio.sql`.

| Tabla | Campos clave |
|---|---|
| `propiedades` | `id`, `categoria` (FK→tipos_propiedad), `titulo`, `localidad`, `ubicacion`, `tamanio`, `servicios`, `caracteristicas`, `mapa` (iframe HTML), `orden`, `vendida` (0/1), `latitud`, `longitud` |
| `tipos_propiedad` | `id`, `nombre_categoria` (7: Casas, Terrenos, Locales, Quintas, Cocheras, Departamentos, Locales comerciales con Casa) |
| `imagenes_propiedades` | `id`, `id_propiedad` (FK), `ruta_imagen` |
| `users` | `id`, `email`, `password` (bcrypt vía `password_hash`). 1 solo user. |

## 6. Config (`config/config.php` + `.env`)

Credenciales y API keys viven en `.env` (no commiteado). Plantilla en `.env.example`. Loader propio en `config/env.php` (sin Composer, usa `parse_ini_file`).

- `config/config.php` detecta entorno por `HTTP_HOST` y elige bloque `DB_LOCAL_*` o `DB_PROD_*` de `.env`.
- Acceder a vars: `env('NOMBRE', $default)`. Constantes: `GOOGLE_MAPS_API_KEY`, `GOOGLE_ANALYTICS_ID`.
- Setup: copiar `.env.example` → `.env` y completar. Si falta `.env` el sitio muere con mensaje claro.

## 7. Auth flow

1. `login.php` muestra form Bootstrap.
2. POST a `auth.php` → query `SELECT id, email, password FROM users WHERE email = ?` (prepared) → `password_verify()`.
3. Setea `$_SESSION['user_id']` y `$_SESSION['user_email']`. Responde JSON `{success, message}`.
4. Cada página de `admin/` valida sesión en `admin/includes/head.php` y redirige a `login.php` si falta.
5. `logout.php` destruye sesión + cookie y redirige.

## 8. URLs amigables (`.htaccess`)

```
RewriteRule ^vendidas/?$ vendidas.php
RewriteRule ^propiedad([0-9]+)$ propiedad.php?id=$1
RewriteRule ^([a-zA-Z0-9_-]+)$ index.php?seccion=$1
RewriteRule ^$ index.php?seccion=inicio
```

Ej: `/propiedad55` → `propiedad.php?id=55`. `/inicio` → `index.php?seccion=inicio`.

## 9. Manejo de imágenes

**Propiedades (admin):**
- Multi-upload desde modal admin.
- `convertToWebP()` en `admin/controllers/controller_propiedades.php` convierte JPG/PNG/GIF → WebP.
- Path en disco: `uploads/propiedades/{categoria}/{id}/{uniqid}.webp`.
- Solo la ruta relativa se guarda en `imagenes_propiedades.ruta_imagen`.
- Al borrar propiedad, también se eliminan archivos físicos.
- `uploads/` está en `.deployignore` → **el deploy NUNCA pisa imágenes subidas**.

**Capua (sección publicitaria):**
- Archivos en `assets/img/capua/`, cargados dinámicamente por `templates/capua.php` con `glob()`.
- Convención de prefijos: `slide-*` (carrusel principal), `complejo-*` (galería expand-on-hover), `transition-*` (crossfade acumulativo), `ubicacion*` (imagen única).
- Lightbox: GLightbox via CDN (CSS en `includes/head.php`, JS init en `includes/footer.php`).

## 9b. Sección Capua de Edilizia (`templates/capua.php`)

Bloque publicitario del proyecto Capua Funes (https://capuafunes.com.ar/) que el estudio tiene en cartera. Va en el home, después del `about`. Estructura interna en 5 sub-bloques:

1. Carrusel principal Bootstrap (slides de propiedades/oficinas) + texto + chips + CTA al sitio oficial
2. Crossfade acumulativo de 3 transition-*.jpg con `@keyframes capua-stack-2|3` (12s ciclo): img1 base siempre visible, img2 y img3 se montan encima
3. Galería complejo-* en **image accordion**: 5 imágenes flush horizontales, hover expande (flex-grow 4) y oscurece las demás; en mobile cae a grid 2-3 col
4. Grid de 10 amenities con bootstrap-icons (Piscina, Cocheras, Áreas verdes, Solarium, Laundry, Bauleras, Bicicleteros, Quincho, Gimnasio, Juegos)
5. Bloque ubicacion.jpg + CTA outline a `google.com/maps/search/?api=1&query=Capua+Funes+Edilizia`

CSS en `assets/css/main.css` (al final) y `assets/scss/sections/_capua.scss`. Paleta del sitio (`#3690e7` accent, `#2d465e` headings), NO la marrón de Capua.

## 10. Patrones de código a respetar

**Query con prepared statement** (estándar en todo el proyecto):
```php
$stmt = $db->prepare("SELECT * FROM propiedades WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$data = $stmt->get_result()->fetch_assoc();
```

**Controller OOP** (`admin/controllers/controller_categorias.php`):
```php
class ControllerCategorias {
    private $db;
    private $resultado = ['estado' => '', 'mensaje' => '', 'data' => null];
    public function __construct($db) { $this->db = $db; }
}
```

**AJAX con FormData** (para uploads):
```js
$.ajax({
  url: 'controllers/controller_propiedades.php',
  type: 'POST',
  data: formData, processData: false, contentType: false,
  success: r => { const d = JSON.parse(r); if (d.success) {/*...*/} }
});
```

- Escape de salida: **siempre** `htmlspecialchars()`.
- Sanitización entrada: `$db->real_escape_string()` para texto, `(int)` para IDs.
- Convenciones: snake_case en PHP/DB, kebab-case en CSS, camelCase en JS.

## 11. Agregar una página nueva

1. Crear `.php` en raíz (o `admin/`).
2. `require_once 'config/config.php';` (carga `$db`).
3. `include_once 'includes/head.php';` (o `admin/includes/head.php` + check sesión).
4. HTML con grid Bootstrap 5.
5. `include_once 'includes/footer.php';`
6. Si va en navegación, agregar link en `includes/head.php`.

## 12. TODOs / pendientes conocidos

- **Alquiler**: desactivado, muestra modal SweetAlert "Próximamente" en nav (`includes/head.php` ~líneas 70-86).
- Sin recovery de password.
- Sin gestión de usuarios admin (solo 1 hardcodeado: `ggiuliano526@gmail.com`).
- Form de contacto sin notificación email visible.
- **Credenciales prod en git history (rotadas, no limpiadas)**: commits `cd18ea3`/`4486b24` contienen passwords DB viejas + Google Maps API key. **Todas rotadas en el proveedor** (DB Hostinger + Maps API regenerada y restringida por referer). History NO se reescribió — decisión consciente: las credenciales viejas ya no funcionan, el costo de force-push + GC manual no compensa. Regla a futuro: jamás commitear secretos, todo va por `.env`.
- SCSS sin pipeline de compilación automatizado en dev.
- Sin cache headers para assets estáticos.

## 13. Comandos / setup local (Docker)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar todo (web + db + phpmyadmin)
docker compose up -d --build

# 3. Acceder
#    Sitio:      http://localhost:8080
#    phpMyAdmin: http://localhost:8081  (user: nz / pass: nzdev)

# Comandos útiles
docker compose logs -f web         # logs apache/php en vivo
docker compose exec web bash       # shell dentro del container
docker compose down                # parar (mantiene datos DB)
docker compose down -v             # parar + borrar volumen DB (reimporta dump al subir)
```

El dump `db/nzestudio.sql` se importa automáticamente la primera vez (cuando el volumen `nz_db_data` está vacío). Para re-importar limpio: `docker compose down -v && docker compose up -d`.

Detalles completos, troubleshooting y comandos avanzados en `docs/DOCKER.md`.

## 13b. CI/CD a producción

**Flujo**:
1. Trabajás en `main` (commits libres, NO dispara nada).
2. Mergeás a `production`: `git checkout production && git merge main && git push`.
3. Push a `production` dispara `deploy.yml` automáticamente.

**Workflow** (`.github/workflows/deploy.yml`): 5 etapas como steps separados (Configuración, Leer SHA, Plan, Deploy, Finalizar). Concurrency lock evita solape. Fail-fast: si un commit del lote falla, los siguientes no se intentan; el `.deployed_sha` queda en el último OK y el próximo push retoma desde ahí (auto-recovery).

**Deploy.sh** (`.github/scripts/deploy.sh`): modular por `--phase=...`, state entre fases en `$RUNNER_TEMP/nz-deploy/state.env`. Con retry wrapper (3 intentos, backoff 5s/15s) y `ConnectTimeout=15` para tolerar glitches transitorios de Hostinger.

**Redeploy manual** (`redeploy.yml`): `workflow_dispatch` con inputs `from_sha`, `to_sha`, `mode (sequential|bulk)`, `update_sha`. Útil para forzar full sync (`from_sha=INITIAL, mode=bulk`) o reaplicar commits específicos.

**Secrets requeridos**: `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`.

**Backup pre-deploy**: tar.gz de `public_html` (excluyendo `uploads/`) en `<DEPLOY_PATH>/../backups/YYYYMMDD_HHMMSS_<sha7>.tar.gz`. Rotación: últimos 5.

**Doc completa**: `docs/DEPLOY.md`.

## 14. Preferencias

- Borrar siempre archivos creados que ya no tengan uso (del CLAUDE.md global).
- Idioma del proyecto y comunicación: **español**.
- A futuro: migrar todo el sitio a **React** (proyecto pendiente, ver memoria del proyecto). Para fixes puntuales seguir en PHP. Refactors grandes evaluarlos a la luz de la migración futura.
- **Commits los hace el usuario**, no Claude. Claude solo entrega el mensaje sugerido (Conventional Commits, ≤50 chars en el subject).
- **Fechas**: server (PHP + MariaDB) opera en **UTC** siempre. La UI formatea a `America/Argentina/Cordoba` con el helper `nz_fmt_ar($utc, $fmt)` de `includes/security.php`. **Nunca** mostrar UTC crudo al usuario; **nunca** cambiar la TZ del SO del server.

## 15. CodeGraph MCP — reducir tokens

Este proyecto tiene un servidor **CodeGraph MCP** configurado (`codegraph_*` tools). Es un grafo SQLite tree-sitter parseado de cada símbolo, edge y archivo. Lecturas sub-milisegundo. **Usar SIEMPRE codegraph antes que Grep/Read masivo** para preguntas estructurales.

### Cuándo usar codegraph (no Grep)

| Pregunta | Tool |
|---|---|
| "¿Dónde está definido X?" / "Buscar símbolo X" | `codegraph_search` |
| "¿Qué llama a función Y?" | `codegraph_callers` |
| "¿Qué llama Y?" | `codegraph_callees` |
| "¿Cómo X llega a Y? / flow de X a Y" | `codegraph_trace` (una llamada = todo el path, incl. callbacks/JSX dinámicos) |
| "¿Qué se rompería si cambio Z?" | `codegraph_impact` |
| "Firma/source/docstring de Y" | `codegraph_node` |
| "Contexto enfocado para tarea/área" | `codegraph_context` |
| "Source de varios símbolos relacionados" | `codegraph_explore` |
| "¿Qué archivos hay bajo path/?" | `codegraph_files` |
| "¿Está sano el index?" | `codegraph_status` |

### Reglas

- **Responder directo, no delegar exploración.** Para "cómo funciona X" / preguntas de arquitectura: 2-3 llamadas codegraph (típicamente `codegraph_context` + 1 `codegraph_explore`). Codegraph YA es el índice — delegar a sub-agentes que graban + leen repite trabajo y cuesta más.
- **Confiar en resultados de codegraph.** Vienen de AST parse completo. NO re-verificar con grep.
- **No grep primero** cuando buscás un símbolo por nombre. `codegraph_search` es más rápido y trae kind+location+signature en una llamada.
- **No encadenar `codegraph_search` + `codegraph_node`** para contexto — usar `codegraph_context` (una llamada).
- **No loop `codegraph_node` sobre muchos símbolos** — usar `codegraph_explore` (una llamada agrupada).
- **Index lag — chequear el banner de staleness.** Si la respuesta arranca con "⚠️ Some files referenced below were edited since the last index sync…", `Read` esos archivos para contenido fresh. Los demás archivos: codegraph es autoritativo.

### Si `.codegraph/` no existe

El MCP server responde "not initialized." Preguntar al usuario: *"Veo que el proyecto no tiene CodeGraph inicializado. ¿Querés que corra `codegraph init -i` para construir el índice?"*

## 16. Context7 MCP — docs actualizadas de librerías

Servidor **Context7 MCP** configurado (`mcp__context7_*`). Da acceso a documentación al día de librerías (DataTables, Bootstrap, SortableJS, PHP, MariaDB, jQuery, etc.) directamente desde la fuente oficial. **Usar SIEMPRE** antes de tirar config/código de librerías externas para evitar errores de syntax/opciones que no existan o que estén deprecadas.

### Cuándo usar context7

- Configurar/restilizar **DataTables** (opciones, pagingType, language, dom).
- Componentes de **Bootstrap** (modal API, classes, JS hooks).
- Plugins (SortableJS options, GLightbox config, AOS init, SweetAlert2).
- Sintaxis/funciones de PHP, mysqli, etc., cuando hay duda de versión.

### Reglas

- **No inventar opciones**. Antes de escribir un config no trivial, resolver el ID de la librería con context7 y consultar el snippet relevante.
- **Citar la versión**. La mayoría de los CDNs del proyecto pinean versión (Bootstrap 5.3.2, jQuery 3.7, DataTables 1.13.7). Pedir docs de esa versión.
- **Si context7 no responde** (no inicializado, sin conexión), avisar al usuario y NO seguir adivinando: pedir confirmación antes de escribir el config.
