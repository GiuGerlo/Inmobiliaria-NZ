<?php

if (!empty($_POST['btnRegistrar'])) {
    $dir = $_POST['txtDir'];
    $cp = $_POST['txtCodP'];
    $tipo = $_POST['txtTipo'];
    $precio = $_POST['txtPrecio'];
    $serv = $_POST['txtServ'];
    $caract = $_POST['txtCaract'];

    if (!empty($dir) && !empty($cp) && !empty($tipo) && !empty($precio) && !empty($serv) && !empty($caract))  {
        $registrar = $conexion->query("INSERT INTO propiedad (Dir_Propiedad, CodP, Tipo_Propiedad, Precio_Propiedad, Serv_Propiedad, Caract_Propiedad) VALUES ('$dir', '$cp', '$tipo', '$precio' , '$serv', '$caract')");

        if ($registrar) {
            $_SESSION['toast'] = [
                'message' => 'Propiedad registrada correctamente',
                'background' => '#28a745', // Color verde éxito
            ];
        } else {
            $_SESSION['toast'] = [
                'message' => 'Error al registrar propiedad',
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