<?php
require_once 'config/config.php';

// Limpiar variables de sesión
$_SESSION = [];

// Borrar cookie de sesión si la hay
if (ini_get('session.use_cookies')) {
    $p = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $p['path'],
        $p['domain'],
        $p['secure'],
        $p['httponly']
    );
}

session_destroy();

header('Location: login.php?logout=1');
exit;
