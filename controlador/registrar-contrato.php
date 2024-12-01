<?php
session_start(); // Asegúrate de iniciar la sesión

if (!empty($_POST['btnRegistrar'])) {
    $dueno = $_POST['txtDueno'];
    $inquilino = $_POST['txtInquilino'];
    $prop = $_POST['txtPropiedad'];
    $ini = $_POST['txtInicio'];
    $fin = $_POST['txtFin'];
    $saldo = $_POST['txtSaldo'];
    $cert = $_POST['txtCert'];

    if (!empty($dueno) && !empty($inquilino) && !empty($prop) && !empty($ini) && !empty($fin) && !empty($cert))  {
        $registrar = $conexion->query("INSERT INTO contrato (ID_Dueno, ID_Inquilino, ID_Propiedad, F_Inicio, F_Fin, Saldo, Certificacion) VALUES ('$dueno', '$inquilino', '$prop', '$ini' , '$fin', '$saldo', '$cert')");

        if ($registrar) {
            $_SESSION['toast'] = [
                'message' => 'Contrato registrado correctamente',
                'background' => '#28a745', // Color verde éxito
            ];
        } else {
            $_SESSION['toast'] = [
                'message' => 'Error al registrar contrato',
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