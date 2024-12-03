<?php

include("../includes/conexion.php");

if (!isset($_GET['id'])) {
    die("ID del recibo no especificado.");
}

$id_recibo = intval($_GET['id']);

ob_start();



?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
        }

        th {
            background-color: #f4f4f4;
        }

        tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        thead {
            background-color: #333;
            color: black
        }

        .table-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 10px 0;
        }

        .total-row {
            font-weight: bold;
            background-color: #f4f4f4;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
        }

        .header-left {
            width: 60%;
            font-size: 12px;
        }

        .header-left img {
            max-width: 100px;
            margin-bottom: 10px;
        }

        .header-left .info {
            line-height: 1.2;
        }

        .header-right {
            text-align: right;
            font-size: 14px;
        }

        .header-right .title {
            font-size: 18px;
            font-weight: bold;
        }

        .header-right .number {
            font-size: 14px;
            margin-top: 5px;
        }

        .header-right .date {
            font-size: 12px;
            margin-top: 5px;
        }

        .header-bottom {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #000;
        }

        .header-bottom .header-left,
        .header-bottom .header-right {
            font-size: 12px;
            line-height: 1.5;
        }

        .accounts table {
            width: 100%;
            margin-top: 15px;
            border-collapse: collapse;
            font-size: 12px;
        }

        .accounts td {
            padding: 5px;
            text-align: left;
        }

        .accounts tr td:last-child {
            text-align: right;
        }

        .accounts tr:last-child td {
            font-weight: bold;
        }
    </style>

    </style>
</head>

<body>
    <?php

    $stmt = $conexion->prepare("
                SELECT r.*, c.F_Inicio, c.F_Fin, i.NYA_Inquilino, i.Tel_Inquilino, p.CodP, ci.Nombre_Ciudad, d.NYA_Dueno FROM recibo r 
                INNER JOIN contrato c ON r.ID_Contrato = c.ID_Contrato INNER JOIN inquilino i ON c.ID_Inquilino = i.ID_Inquilino 
                INNER JOIN dueno d ON c.ID_Dueno = d.ID_Dueno INNER JOIN propiedad p ON 
                c.ID_Propiedad = p.ID_Propiedad INNER JOIN ciudad ci ON p.CodP = ci.CodP WHERE r.Nro_Recibo = ?
            ");

    $stmt->bind_param("i", $id_recibo);
    $stmt->execute();
    $datos = $stmt->get_result()->fetch_object();

    // Definir la variable total
    $total = $datos->Pago_Propiedad
        + $datos->Pago_Municipal
        + $datos->Pago_Agua
        + $datos->Pago_Electricidad
        + $datos->Pago_Gas
        + $datos->Honorarios;

    //Defino formato a las fechas de inicio y fin
    $F_Ini = $datos-> F_Inicio;
    $F_Ini = date("d-m-Y");

    $F_Fin = $datos-> F_Fin;
    $F_Fin = date("d-m-Y");
    ?>
    <div class="header">
        <!-- Sección izquierda -->
        <div class="header-left">
            <img src="<?= $_SERVER['DOCUMENT_ROOT'] ?>/assets/logo-nadina.jpg" alt="Logo Nadina">
            <div class="info">
                <strong>Localidad:</strong> Guatimozín | <strong>Teléfono:</strong> 3468-495281<br>
                <strong>Dirección:</strong> Catamarca 227 | <strong>Horario:</strong> 8 hs a 12hs - 16hs a 20hs<br>
                <strong>CUIT:</strong> 27-27036340-2
            </div>
        </div>

        <!-- Sección derecha -->
        <div class="header-right">
            <div class="title">RECIBO</div>
            <div class="number"><?= $datos->Nro_Recibo ?></div>
            <div class="date"><?= date("d/m/Y") ?></div>
        </div>
    </div>
    <div class="header-bottom">
        <!-- Izquierda: Información del inquilino -->
        <div class="header-left">
            <strong>Inquilino:</strong> <?= $datos->NYA_Inquilino ?><br>
            <strong>Teléfono:</strong> <?= $datos->Tel_Inquilino ?><br>
            <strong>I.V.A:</strong> Consumidor Final
        </div>

        <!-- Derecha: Información del contrato -->
        <div class="header-right">
            <strong>Contrato:</strong> Inicio: <?= $F_Ini ?> <b>-</b> Fin: <?= $F_Fin ?><br>
            <strong>En concepto de:</strong> Alquiler<br>
            <strong>Propiedad:</strong> <?= $datos->Nombre_Ciudad ?><br>
            <strong>Dueño:</strong> <?= $datos->NYA_Dueno ?><br>
            <strong>Mes/Año:</strong> <?= $datos->Mes_Rend ?> / <?= $datos->Ano_Rend ?>
        </div>
    </div>

    <div class="accounts">
        <table>
            <tr>
                <td>Alquiler</td>
                <td>$<?= number_format($datos->Pago_Propiedad, 2, ',', '.') ?></td>
            </tr>
            <tr>
                <td>Municipal</td>
                <td>$<?= number_format($datos->Pago_Municipal, 2, ',', '.') ?></td>
            </tr>
            <tr>
                <td>Agua</td>
                <td>$<?= number_format($datos->Pago_Agua, 2, ',', '.') ?></td>
            </tr>
            <tr>
                <td>Electricidad</td>
                <td>$<?= number_format($datos->Pago_Electricidad, 2, ',', '.') ?></td>
            </tr>
            <tr>
                <td>Gas</td>
                <td>$<?= number_format($datos->Pago_Gas, 2, ',', '.') ?></td>
            </tr>
            <tr>
                <td>Honorarios</td>
                <td>$<?= number_format($datos->Honorarios, 2, ',', '.') ?></td>
            </tr>
            <tr>
                <td><strong>Total Recibo:</strong></td>
                <td><strong>$<?= number_format($total, 2, ',', '.') ?></strong></td>
            </tr>
        </table>
    </div>

</body>

</html>

<?php

$html = ob_get_clean();

require_once("../dompdf/autoload.inc.php");

use Dompdf\Dompdf;



// $options = $dompdf->getOption();
// $options->set(array('isRemoteEnabled => true'));
// $dompdf->setOptions($options);

$dompdf = new Dompdf();
$dompdf->loadHtml($html);

// Configura el tamaño del papel y los márgenes
$dompdf->setPaper('A4', 'landscape'); // 'portrait' o 'landscape'

$dompdf->render();

// Formatear la fecha de hoy
$fecha_hoy = date("d-m-Y");

// Construir el nombre del archivo PDF
$nombre_pdf = "recibo_{$datos->Nro_Recibo}_{$fecha_hoy}_{$datos->NYA_Inquilino}.pdf";

// Generar el PDF con el nombre personalizado
$dompdf->stream($nombre_pdf, ["Attachment" => false]);

