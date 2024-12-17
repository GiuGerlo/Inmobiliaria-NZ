<?php

include("../includes/conexion.php");

date_default_timezone_set('America/Argentina/Buenos_Aires');

if (!isset($_GET['id'])) {
    die("ID del recibo no especificado");
}

$id_recibo = intval($_GET['id']);

ob_start();

$stmt = $conexion->prepare("
    SELECT r.*, c.F_Inicio, c.F_Fin, i.NYA_Inquilino, i.Tel_Inquilino, p.CodP, p.Dir_Propiedad, ci.Nombre_Ciudad, d.NYA_Dueno, fp.Desc_FP
    FROM recibo r 
    INNER JOIN contrato c ON r.ID_Contrato = c.ID_Contrato 
    INNER JOIN inquilino i ON c.ID_Inquilino = i.ID_Inquilino 
    INNER JOIN dueno d ON c.ID_Dueno = d.ID_Dueno 
    INNER JOIN propiedad p ON c.ID_Propiedad = p.ID_Propiedad 
    INNER JOIN ciudad ci ON p.CodP = ci.CodP
    INNER JOIN formadepago fp on fp.ID_FP = r.ID_FP
    WHERE r.Nro_Recibo = ?
");

$stmt->bind_param("i", $id_recibo);
$stmt->execute();
$datos = $stmt->get_result()->fetch_object();

if (!$datos) {
    die("Recibo no encontrado");
}

// **CÁLCULOS**
// Suma de ingresos
$ingresos = [
    $datos->Pago_Propiedad,
    $datos->Pago_Municipal,
    $datos->Pago_Agua,
    $datos->Pago_Electricidad,
    $datos->Pago_Gas
];
$suma = array_sum($ingresos);

// Comisión (10% del alquiler)
$comision = $datos->Pago_Propiedad * 0.10;

// Egresos
$egresos = $comision + $datos->Arreglos + $datos->Sepelio;

// Total disponible
$total = $suma - $egresos;

// Formateo de la fecha
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
            <img src="http://localhost/proyectos-php/inmobiliaria-nz/assets/logo-nadina.jpg" alt="Logo Nadina">
            <!-- <img src="https://nz-administracion.net/assets/logo-nadina.jpg" alt="Logo Nadina"> -->
        </div>
        <div>
            <h1>Rendición de cuentas</h1>
            <p><strong>Fecha de emisión:</strong> <?= date("d/m/Y") ?></p>
            <p><strong>Dirección:</strong> <?= $datos->Dir_Propiedad ?></p>
            <p><strong>Forma de pago:</strong> <?= $datos->Desc_FP ?></p>
        </div>
    </div>

    <div class="title"><?= htmlspecialchars($datos->NYA_Dueno) ?></div>

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
                <td>
                    <table class="inner-table">
                        <?php
                        $labels = [
                            "Fecha" => $F_Pago,
                            "Inquilino" => htmlspecialchars($datos->NYA_Inquilino),
                            "Mes/Año" => "{$datos->Mes_Rend} / {$datos->Ano_Rend}",
                            //"Direccion" => htmlspecialchars($datos->$Dir_Propiedad),
                            //"FP" => htmlspecialchars($datos->$Desc_FP),
                            "Alquiler" => "$" . number_format($datos->Pago_Propiedad, 2, ',', '.'),
                            "Municipal" => "$" . number_format($datos->Pago_Municipal, 2, ',', '.'),
                            "Agua" => "$" . number_format($datos->Pago_Agua, 2, ',', '.'),
                            "Electricidad" => "$" . number_format($datos->Pago_Electricidad, 2, ',', '.'),
                            "Gas" => "$" . number_format($datos->Pago_Gas, 2, ',', '.')

                        ];


                        foreach ($labels as $key => $value) {
                            echo "<tr><td><strong>{$key}:</strong></td><td>{$value}</td></tr>";
                        }
                        ?>
                    </table>
                </td>
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
                            <td><strong>Otros:</strong></td>
                            <td>$<?= number_format($datos->Sepelio, 2, ',', '.') ?></td>
                        </tr>
                    </table>
                </td>
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
        <p><strong>Comentarios:</strong> <?= htmlspecialchars($datos->Comentarios) ?></p>
    </div>

    <div class="firma">
        <img src="http://localhost/proyectos-php/inmobiliaria-nz/assets/FirmaDigital.jpg" width="150px" alt="Firma">
        <!-- <img src="https://nz-administracion.net/assets/FirmaDigital.jpg" width="150px" alt="Firma"> -->
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
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$fecha_hoy = date("d-m-Y");
$nombre_pdf = "rendicion_{$datos->Nro_Recibo}_{$fecha_hoy}_{$datos->NYA_Dueno}.pdf";

$dompdf->stream($nombre_pdf, ["Attachment" => false]);
