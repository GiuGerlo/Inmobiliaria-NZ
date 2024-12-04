<?php
// Recibir los parámetros de la URL
$mes = isset($_GET['mes']) ? $_GET['mes'] : '';
$ano = isset($_GET['ano']) ? $_GET['ano'] : '';

// Validar los parámetros
if ($mes && $ano) {
    // Generar el PDF o realizar alguna acción con $mes y $ano
    echo "Generando PDF para Mes: $mes y Año: $ano";
} else {
    echo "Por favor, selecciona un mes y un año.";
}
?>
