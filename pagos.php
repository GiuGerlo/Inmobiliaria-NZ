<?php
include("includes/conexion.php");

// Recibir los parámetros de la URL
$mes = isset($_GET['mes']) ? $_GET['mes'] : '';
$ano = isset($_GET['ano']) ? $_GET['ano'] : '';

// Validar los parámetros
if (!$mes || !$ano) {
    echo "Por favor, selecciona un mes y un año.";
    exit;
}

ob_start();

// Consulta para obtener los recibos pagados
$sql_pagados = "
    SELECT 
        contrato.ID_Contrato,
        inquilino.NYA_Inquilino,
        dueno.NYA_Dueno,
        DATE_FORMAT(contrato.F_Inicio, '%d/%m/%Y') AS F_Inicio,
        DATE_FORMAT(recibo.F_Pago, '%d/%m/%Y') AS F_Pago,
        recibo.Pago_Municipal,
        recibo.Pago_Agua,
        recibo.Pago_Gas,
        recibo.Pago_Electricidad,
        recibo.Pago_Propiedad,
        contrato.Certificacion,
        recibo.Honorarios
    FROM recibo
    INNER JOIN contrato ON recibo.ID_Contrato = contrato.ID_Contrato
    INNER JOIN inquilino ON contrato.ID_Inquilino = inquilino.ID_Inquilino
    INNER JOIN dueno ON contrato.ID_Dueno = dueno.ID_Dueno
    WHERE recibo.Mes_Rend = '$mes' AND recibo.Ano_Rend = $ano
";

// Consulta para obtener los contratos sin recibos y agregar Precio_Propiedad
$sql_no_pagados = "
    SELECT 
        contrato.ID_Contrato,
        inquilino.NYA_Inquilino,
        dueno.NYA_Dueno,
        DATE_FORMAT(contrato.F_Inicio, '%d/%m/%Y') AS F_Inicio,
        propiedad.Precio_Propiedad,
        contrato.Certificacion
    FROM contrato
    LEFT JOIN recibo ON contrato.ID_Contrato = recibo.ID_Contrato 
        AND recibo.Mes_Rend = '$mes' 
        AND recibo.Ano_Rend = $ano
    INNER JOIN inquilino ON contrato.ID_Inquilino = inquilino.ID_Inquilino
    INNER JOIN dueno ON contrato.ID_Dueno = dueno.ID_Dueno
    INNER JOIN propiedad ON contrato.ID_Propiedad = propiedad.ID_Propiedad
    WHERE recibo.ID_Contrato IS NULL
";

// Ejecutar las consultas
$result_pagados = $conexion->query($sql_pagados);
$result_no_pagados = $conexion->query($sql_no_pagados);

// Mostrar el mes y año seleccionados
echo "<h1>Reporte de recibos de $mes de $ano</h1>";

// Estilos CSS embebidos
echo "<style>
    body {
        font-family: Arial, sans-serif;
        margin: 20px;
    }
    h1, h2 {
        text-align: center;
        color: #333;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    th, td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
        font-size: 14px;
    }
    th {
        background-color: #f4f4f4;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    .pagados th {
        background-color: #d4edda;
        color: #155724;
    }
    .no-pagados th {
        background-color: #f8d7da;
        color: #721c24;
    }
</style>";

// Mostrar tabla de recibos pagados
echo "<h2>Pagados</h2>";
if ($result_pagados->num_rows > 0) {
    echo "<table class='pagados'>
            <tr>
                <th>Fecha Pago</th>
                <th>Inquilino</th>
                <th>Dueño</th>
                <th>CTTO</th>
                <th>Mun.</th>
                <th>Agua</th>
                <th>Gas</th>
                <th>Electr.</th>
                <th>Imp.</th>
                <th>Comisión</th>
                <th>Entrega</th>
                <th>Honorarios</th>
                <th>Cert.</th>
            </tr>";
    while ($row = $result_pagados->fetch_assoc()) {
        $comision = $row['Pago_Propiedad'] * 0.10;
        $entrega = (
            $row['Pago_Propiedad'] +
            $row['Pago_Municipal'] +
            $row['Pago_Agua'] +
            $row['Pago_Gas'] +
            $row['Pago_Electricidad']
        ) - $comision;
        echo "<tr>
                <td>{$row['F_Pago']}</td>
                <td>{$row['NYA_Inquilino']}</td>
                <td>{$row['NYA_Dueno']}</td>
                <td>{$row['F_Inicio']}</td>
                <td>{$row['Pago_Municipal']}</td>
                <td>{$row['Pago_Agua']}</td>
                <td>{$row['Pago_Gas']}</td>
                <td>{$row['Pago_Electricidad']}</td>
                <td>{$row['Pago_Propiedad']}</td>
                <td>" . number_format($comision, 2) . "</td>
                <td>" . number_format($entrega, 2) . "</td>
                <td>" . number_format($row['Honorarios'], 2) . "</td>
                <td>{$row['Certificacion']}</td>
            </tr>";
    }
    echo "</table>";
} else {
    echo "<p>No hay recibos pagados para este mes y año.</p>";
}

// Mostrar tabla de contratos no pagados
echo "<h2>No Pagados</h2>";
if ($result_no_pagados->num_rows > 0) {
    echo "<table class='no-pagados'>
            <tr>
                <th>Inquilino</th>
                <th>Dueño</th>
                <th>Fecha Inicio</th>
                <th>Precio Propiedad</th>
                <th>Certificación</th>
            </tr>";
    while ($row = $result_no_pagados->fetch_assoc()) {
        echo "<tr>
                <td>{$row['NYA_Inquilino']}</td>
                <td>{$row['NYA_Dueno']}</td>
                <td>{$row['F_Inicio']}</td>
                <td>{$row['Precio_Propiedad']}</td>
                <td>{$row['Certificacion']}</td>
            </tr>";
    }
    echo "</table>";
} else {
    echo "<p>No hay contratos sin recibos para este mes y año.</p>";
}

$html = ob_get_clean();

require_once("./dompdf/autoload.inc.php");

use Dompdf\Dompdf;

$dompdf = new Dompdf();
$dompdf->set_option('isRemoteEnabled', 'true');
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'landscape');
$dompdf->render();

$nombre_pdf = "pagos_" . date("d-m-Y") . ".pdf";
$dompdf->stream($nombre_pdf, ["Attachment" => false]);
