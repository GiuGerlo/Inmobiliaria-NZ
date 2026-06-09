<?php

if(!empty($_POST["btnModificar"])){
    $id = $_POST['txtId'];
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

    if (!empty($contrato) && !empty($fp) && !empty($fpago) && !empty($pagop) && !empty($mes) && !empty($ano)) {
        
    $modificar=$conexion->query("UPDATE recibo SET ID_Contrato='$contrato', ID_FP='$fp', F_Pago='$fpago', Pago_Propiedad='$pagop', Mes_Rend = '$mes', Ano_Rend = '$ano', Pago_Municipal='$municipal', Pago_Agua='$agua', Pago_Electricidad = '$electr', Pago_Gas = '$gas', Arreglos='$arreglo', Comentarios='$com', Sepelio = '$sep', Honorarios = '$honor' WHERE Nro_Recibo='$id'");
    if ($modificar==true) {
        echo "<div class='alert alert-success'>Recibo modificado</div>";
    } else {
        echo "<div class='alert alert-danger'>Error al modificar</div>";
    }
    

    } else {
        echo "<div class='alert alert-danger'>Faltan datos, inténtalo de nuevo</div>";
    } ?>

    <script>
        window.history.replaceState(null, null, window.location.pathname);
    </script>

<?php }