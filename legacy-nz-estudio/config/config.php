<?php
// ─── Hardening de sesión ──────────────────────────────────────────────
// Debe aplicarse ANTES de session_start(). Si la sesión ya estaba iniciada
// (otro archivo más arriba en la pila), estos ini_set no aplican — por eso
// config/config.php debe ser el primer require en cada entrypoint.
if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    $secure = (
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    );

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    if ($secure) {
        ini_set('session.cookie_secure', '1');
    }
    session_start();
}

require_once __DIR__ . '/env.php';

// Detectar entorno: Docker > Laragon (legacy) > Producción.
// Docker: el Dockerfile setea ENV NZ_ENV=docker. También match por puerto 8080 en HTTP_HOST.
$host       = $_SERVER['HTTP_HOST'] ?? '';
$isDocker   = (getenv('NZ_ENV') === 'docker') || str_contains($host, ':8080');
$isLaragon  = !$isDocker && (
    in_array($host, ['localhost', '127.0.0.1'], true)
    || str_contains($host, '.test')
    || str_contains($host, '.local')
);

if ($isDocker) {
    $server   = env('DB_DOCKER_HOST', 'db');
    $username = env('DB_DOCKER_USER', 'nz');
    $password = env('DB_DOCKER_PASS', 'nzdev');
    $database = env('DB_DOCKER_NAME', 'nz-estudio');
} elseif ($isLaragon) {
    $server   = env('DB_LOCAL_HOST', 'localhost:3307');
    $username = env('DB_LOCAL_USER', 'root');
    $password = env('DB_LOCAL_PASS', '');
    $database = env('DB_LOCAL_NAME', 'nz-estudio');
} else {
    $server   = env('DB_PROD_HOST');
    $username = env('DB_PROD_USER');
    $password = env('DB_PROD_PASS');
    $database = env('DB_PROD_NAME');
}

// Crear conexión con MySQL
$db = new mysqli($server, $username, $password, $database);

// Verificar la conexión
if ($db->connect_error) {
    die("❌ Error de conexión a la base de datos: " . $db->connect_error);
}

// Evitar problemas con acentos y caracteres especiales
$db->set_charset("utf8mb4");

// Constantes de servicios externos
define('GOOGLE_MAPS_API_KEY', env('GOOGLE_MAPS_API_KEY', ''));
define('GOOGLE_ANALYTICS_ID', env('GOOGLE_ANALYTICS_ID', ''));

// Helpers de seguridad: CSRF, headers, guard de admin, validate_upload, etc.
require_once __DIR__ . '/../includes/security.php';

// Aplicar headers seguros en TODAS las respuestas (públicas + admin + JSON).
nz_set_secure_headers();
