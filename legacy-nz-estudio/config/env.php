<?php
/**
 * Loader mínimo de variables de entorno desde .env (sin dependencias).
 * Carga el archivo una sola vez y expone env($clave, $default).
 */

if (!function_exists('env')) {
    function loadEnv(string $path): void
    {
        static $loaded = false;
        if ($loaded) return;
        $loaded = true;

        if (!is_readable($path)) {
            die("❌ Archivo .env no encontrado en: {$path}. Copiá .env.example a .env y completá los valores.");
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = ltrim($line);
            if ($line === '' || $line[0] === '#' || $line[0] === ';') continue;
            if (strpos($line, '=') === false) continue;

            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Quitar comillas envolventes si las hay
            if (strlen($value) >= 2) {
                $first = $value[0];
                $last  = $value[strlen($value) - 1];
                if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                    $value = substr($value, 1, -1);
                }
            }

            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }
    }

    function env(string $key, $default = null)
    {
        $value = $_ENV[$key] ?? getenv($key);
        if ($value === false || $value === null || $value === '') {
            return $default;
        }
        return $value;
    }
}

loadEnv(__DIR__ . '/../.env');
