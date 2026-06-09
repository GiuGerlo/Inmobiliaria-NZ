<?php

if (!empty($_POST['btnRegistrar'])) {
    $contrato = $_POST['txtContrato'];
    $fp = $_POST['txtFP'];
    $fpago = $_POST['txtFecP'];
    $pagop = $_POST['txtPagoP'];
    $mes = $_POST['txtMes'];
    $ano = $_POST['txtAno'];
    $municipal = $_POST['txtMunicipal'];
    $agua = $_POST['txtAgua'];
    $electr = $_POST['txtElectricidad'];
    $gas = $_POST['txtGas'];
    $arreglo = $_POST['txtArreglo'];
    $com = $_POST['txtComentarios'];
    $sep = $_POST['txtSepelio'];
    $honor = $_POST['txtHonorarios'];

    if (!empty($contrato) && !empty($fp) && !empty($fpago) && !empty($pagop) && !empty($mes) && !empty($ano))  {
        $registrar = $conexion->query("INSERT INTO recibo (ID_Contrato, ID_FP, F_Pago, Pago_Propiedad, Mes_Rend, Ano_Rend, Pago_Municipal, Pago_Agua, Pago_Electricidad, Pago_Gas, Arreglos, Comentarios, Sepelio, Honorarios) VALUES ('$contrato', '$fp', '$fpago', '$pagop' , '$mes', '$ano', '$municipal', '$agua' , '$electr', '$gas', '$arreglo', '$com' , '$sep', '$honor')");

        if ($registrar) {
            $_SESSION['toast'] = [
                'message' => 'Recibo registrado correctamente',
                'background' => '#28a745', // Color verde éxito
            ];
        } else {
            $_SESSION['toast'] = [
                'message' => 'Error al registrar el recibo',
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