<?php

include("../includes/conexion.php");
include("../templates/utils.php");

date_default_timezone_set('America/Argentina/Buenos_Aires');

if (!isset($_GET['id'])) {
    die("ID del recibo no especificado.");
}

$id_recibo = intval($_GET['id']);
ob_start();

$stmt = $conexion->prepare("
    SELECT r.*, c.F_Inicio, c.F_Fin, i.NYA_Inquilino, i.Tel_Inquilino, p.CodP, ci.Nombre_Ciudad, d.NYA_Dueno 
    FROM recibo r 
    INNER JOIN contrato c ON r.ID_Contrato = c.ID_Contrato 
    INNER JOIN inquilino i ON c.ID_Inquilino = i.ID_Inquilino 
    INNER JOIN dueno d ON c.ID_Dueno = d.ID_Dueno 
    INNER JOIN propiedad p ON c.ID_Propiedad = p.ID_Propiedad 
    INNER JOIN ciudad ci ON p.CodP = ci.CodP 
    WHERE r.Nro_Recibo = ?
");

$stmt->bind_param("i", $id_recibo);
$stmt->execute();
$datos = $stmt->get_result()->fetch_object();

// Formatear fechas
$F_Ini = date("d-m-Y", strtotime($datos->F_Inicio));
$F_Fin = date("d-m-Y", strtotime($datos->F_Fin));

// Calcular total
$total = array_sum([
    $datos->Pago_Propiedad,
    $datos->Pago_Municipal,
    $datos->Pago_Agua,
    $datos->Pago_Electricidad,
    $datos->Pago_Gas,
    $datos->Honorarios
]);

$totalEnLetras = convertirNumeroALetras($total);

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

        /* Estilos para la sección de firma */
        .firma {
            text-align: left;
            margin-top: 40px;
        }

        .firma img {
            max-width: 150px;
            display: block;
            margin-bottom: 10px;
        }

        .firma p {
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
        }
    </style>

</head>

<body>
    <div class="header">
        <div class="header-left">
            <img src="http://localhost/proyectos-php/inmobiliaria-nz/assets/logo-nadina.jpg" alt="Logo Nadina">
            <div class="info">
                <strong>Localidad:</strong> Guatimozín | <strong>Teléfono:</strong> 3468-495281<br>
                <strong>Dirección:</strong> Catamarca 227 | <strong>Horario:</strong> 8 hs a 12hs - 16hs a 20hs<br>
                <strong>CUIT:</strong> 27-27036340-2
            </div>
        </div>
        <div class="header-right">
            <div class="title">RECIBO</div>
            <div class="number"><?= $datos->Nro_Recibo ?></div>
            <div class="date"><?= date("d/m/Y") ?></div>
        </div>
    </div>

    <div class="header-bottom">
        <div class="header-left">
            <strong>Inquilino:</strong> <?= $datos->NYA_Inquilino ?><br>
            <strong>Teléfono:</strong> <?= $datos->Tel_Inquilino ?><br>
            <strong>I.V.A:</strong> Consumidor Final
        </div>
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
            <?php
            // Array de los cargos
            $items = [
                "Alquiler" => $datos->Pago_Propiedad,
                "Municipal" => $datos->Pago_Municipal,
                "Agua" => $datos->Pago_Agua,
                "Electricidad" => $datos->Pago_Electricidad,
                "Gas" => $datos->Pago_Gas,
                "Honorarios" => $datos->Honorarios
            ];

            foreach ($items as $label => $value) {
                echo "<tr><td>{$label}</td><td>$" . number_format($value, 2, ',', '.') . "</td></tr>";
            }
            ?>

            <tr>
                <td><strong>Total:</strong></td>
                <td><strong>$<?= number_format($total, 2, ',', '.') ?></strong></td>
            </tr>
        </table>
        <div style="text-align: center;">
            <h4>
                Recibi(mos) la suma de: Pesos <?= $totalEnLetras ?>
            </h4>
        </div>

    </div>

    <div class="firma">
        <img src="http://localhost/proyectos-php/inmobiliaria-nz/assets/FirmaDigital.jpg" width="150px" alt="Firma">
        <p>Firma</p>
    </div>
</body>

</html>

<?php

$html = ob_get_clean();

require_once("../dompdf/autoload.inc.php");

use Dompdf\Dompdf;

$dompdf = new Dompdf();
$dompdf->set_option('isRemoteEnabled', 'true');
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait'); // 'portrait' o 'landscape'
// $options = new Options();
// $options->set('isRemoteEnabled', true);
// $dompdf = new Dompdf($options); // Usa estas opciones al instanciar el objeto
$dompdf->render();

$fecha_hoy = date("d-m-Y");
$nombre_pdf = "recibo_{$datos->Nro_Recibo}_{$fecha_hoy}_{$datos->NYA_Inquilino}.pdf";
$dompdf->stream($nombre_pdf, ["Attachment" => false]);
?>