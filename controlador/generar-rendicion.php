<?php

include("../includes/conexion.php");

if (!isset($_GET['id'])) {
    die("ID del recibo no especificado");
}

$id_recibo = intval($_GET['id']);

ob_start();

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rendicion</title>
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

    //DEFINIMOS SUMA
    $suma = $datos->Pago_Propiedad
        + $datos->Pago_Municipal
        + $datos->Pago_Agua
        + $datos->Pago_Electricidad
        + $datos->Pago_Gas
        + $datos->Honorarios;

    // DEFINIMOS COMISION
    $comision = $datos-> Pago_Propiedad * 10 / 100;

    // DEFINIMOS COMISION
    $restas = $datos-> Arreglos + $datos-> Sepelio;

    //DEFINIMOS TOTAL
    $total = $suma - ($comision + $restas);

    //Defino formato a las fechas de inicio y fin
    $F_Pago = date("d-m-Y", strtotime($datos->F_Pago));

    ?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rendición de cuentas</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .header img {
            max-width: 150px;
        }

        .title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .table th,
        .table td {
            border: 1px solid #000;
            padding: 10px;
            text-align: left;
        }

        .table th {
            background-color: #f4f4f4;
            text-align: center;
        }

        .inner-table {
            width: 100%;
            border-collapse: collapse;
        }

        .inner-table td {
            border: 1px solid #ccc;
            padding: 5px;
        }

        .comments {
            margin-top: 20px;
            font-style: italic;
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
        <div>
            <img src="<?= $_SERVER['DOCUMENT_ROOT'] ?>/assets/logo-nadina.jpg" alt="Logo">
        </div>
        <div>
            <h1>Rendición de cuentas</h1>
            <p><strong>Fecha de emisión:</strong> <?= date("d/m/Y") ?></p>
        </div>
    </div>

    <div class="title"><?= $datos->NYA_Dueno ?></div>

    <table class="table">
        <thead>
            <tr>
                <th>INGRESOS</th>
                <th>EGRESOS</th>
                <th>ENTREGAS</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <!-- INGRESOS -->
                <td>
                    <table class="inner-table">
                        <tr>
                            <td><strong>Fecha:</strong></td>
                            <td><?= $F_Pago ?></td>
                        </tr>
                        <tr>
                            <td><strong>Inquilino:</strong></td>
                            <td><?= $datos->NYA_Inquilino ?></td>
                        </tr>
                        <tr>
                            <td><strong>Mes/Año:</strong></td>
                            <td><?= $datos->Mes_Rend ?> / <?= $datos->Ano_Rend ?></td>
                        </tr>
                        <tr>
                            <td><strong>Alquiler:</strong></td>
                            <td>$<?= number_format($datos->Pago_Propiedad, 2, ',', '.') ?></td>
                        </tr>
                        <tr>
                            <td><strong>Municipal:</strong></td>
                            <td>$<?= number_format($datos->Pago_Municipal, 2, ',', '.') ?></td>
                        </tr>
                        <tr>
                            <td><strong>Agua:</strong></td>
                            <td>$<?= number_format($datos->Pago_Agua, 2, ',', '.') ?></td>
                        </tr>
                        <tr>
                            <td><strong>Electricidad:</strong></td>
                            <td>$<?= number_format($datos->Pago_Electricidad, 2, ',', '.') ?></td>
                        </tr>
                        <tr>
                            <td><strong>Gas:</strong></td>
                            <td>$<?= number_format($datos->Pago_Gas, 2, ',', '.') ?></td>
                        </tr>
                        <tr>
                            <td><strong>Honorarios:</strong></td>
                            <td>$<?= number_format($datos->Honorarios, 2, ',', '.') ?></td>
                        </tr>
                    </table>
                </td>

                <!-- EGRESOS -->
                <td>
                    <table class="inner-table">
                        <tr>
                            <td><strong>Comisión:</strong></td>
                            <td>$<?= number_format($comision, 2, ',', '.') ?></td>
                        </tr>
                        <tr>
                            <td><strong>Arreglos:</strong></td>
                            <td>$<?= number_format($datos->Arreglos, 2, ',', '.') ?></td>
                        </tr>
                        <tr>
                            <td><strong>Sepelio:</strong></td>
                            <td>$<?= number_format($datos->Sepelio, 2, ',', '.') ?></td>
                        </tr>
                    </table>
                </td>

                <!-- ENTREGAS -->
                <td>
                    <table class="inner-table">
                        <tr>
                            <td><strong>Total:</strong></td>
                            <td>$<?= number_format($total, 2, ',', '.') ?></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="comments">
        <p><strong>Comentarios:</strong> <?= $datos->Comentarios ?></p>
    </div>

    <!-- Sección de firma -->
    <div class="firma">
        <!-- Imagen de la firma -->
        <img src="<?= $_SERVER['DOCUMENT_ROOT'] ?>assets/FirmaDigital.png" alt="Firma">
        <p>Firma</p>
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
$nombre_pdf = "rendicion_{$datos->Nro_Recibo}_{$fecha_hoy}_{$datos->NYA_Dueno}.pdf";

// Generar el PDF con el nombre personalizado
$dompdf->stream($nombre_pdf, ["Attachment" => false]);