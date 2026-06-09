<?php

if(!empty($_POST["btnModificar"])){
    $id = $_POST['txtId'];
    $dueno = $_POST['txtDueno'];
    $inquilino = $_POST['txtInquilino'];
    $prop = $_POST['txtPropiedad'];
    $ini = $_POST['txtInicio'];
    $fin = $_POST['txtFin'];
    $saldo = $_POST['txtSaldo'];
    $cert = $_POST['txtCert'];

    if (!empty($dueno) && !empty($inquilino) && !empty($prop) && !empty($ini) && !empty($fin) && !empty($cert)) {
        
    $modificar=$conexion->query("UPDATE contrato SET ID_Dueno='$dueno', ID_Inquilino='$inquilino', ID_Propiedad='$prop',F_Inicio='$ini', F_Fin = '$fin', Saldo = '$saldo', Certificacion = '$cert' WHERE ID_Contrato='$id'");
    if ($modificar==true) {
        echo "<div class='alert alert-success'>Contrato modificado</div>";
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