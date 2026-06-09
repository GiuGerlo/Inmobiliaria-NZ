<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
} // Iniciar la sesión al principio

// Configuración de la conexión según el entorno
if ($_SERVER['HTTP_HOST'] === 'localhost') { // Entorno local
    $server = 'localhost';
    $username = 'root';
    $password = '';
    $database = 'db-inmobiliaria-nz';
    $port = 3307; // Puerto local
} else { // Entorno de producción
    $server = '127.0.0.1';
    $username = 'u407412506_giuliano';
    $password = '#Giuli45411498';
    $database = 'u407412506_nzadmin';
    $port = 3306; // Puerto estándar para MySQL
}

// Crear la conexión usando mysqli
$conexion = new mysqli($server, $username, $password, $database, $port);

// Verificar la conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error); // Manejar el error de conexión
}

// Configurar el conjunto de caracteres
$conexion->set_charset("utf8");
?>
