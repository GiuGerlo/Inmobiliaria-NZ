<?php
session_start(); // Asegúrate de iniciar la sesión

if (!empty($_POST['btnRegistrar'])) {
    $cp = $_POST['txtCodP'];
    $ciudad = $_POST['txtNombre'];

    if (!empty($cp) && !empty($ciudad)) {
        $registrar = $conexion->query("INSERT INTO ciudad (CodP, Nombre_Ciudad) VALUES ('$cp', '$ciudad')");

        if ($registrar) {
            $_SESSION['toast'] = [
                'message' => 'Ciudad registrada correctamente',
                'background' => '#28a745', // Color verde éxito
            ];
        } else {
            $_SESSION['toast'] = [
                'message' => 'Error al registrar la ciudad',
                'background' => '#dc3545', // Color rojo error
            ];
        }
    } else {
        $_SESSION['toast'] = [
            'message' => 'Faltaron datos por ingresar, inténtalo de nuevo',
            'background' => '#ffc107', // Color amarillo advertencia
        ];
    }

    // Redirige a la misma página para evitar doble envío del formulario
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}
?>