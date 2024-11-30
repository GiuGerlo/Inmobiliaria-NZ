<?php
session_start(); // Asegúrate de iniciar la sesión

if (!empty($_POST['btnRegistrar'])) {
    $nya = $_POST['txtNyA'];
    $cp = $_POST['txtCodP'];
    $tel = $_POST['txtTel'];
    $email = $_POST['txtEmail'];

    if (!empty($nya) && !empty($cp) && !empty($tel) && !empty($email)) {
        $registrar = $conexion->query("INSERT INTO dueno (NYA_Dueno, CodP, Tel_Dueno, Email_Dueno) VALUES ('$nya', '$cp', '$tel', '$email')");

        if ($registrar) {
            $_SESSION['toast'] = [
                'message' => 'Dueño registrado correctamente',
                'background' => '#28a745', // Color verde éxito
            ];
        } else {
            $_SESSION['toast'] = [
                'message' => 'Error al registrar el dueño',
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
