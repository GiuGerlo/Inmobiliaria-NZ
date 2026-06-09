<?php

if(!empty($_POST["btnModificar"])){
    $id = $_POST['txtId'];
    $dir = $_POST['txtDir'];
    $cp = $_POST['txtCodP'];
    $tipo = $_POST['txtTipo'];
    $precio = $_POST['txtPrecio'];
    $serv = $_POST['txtServ'];
    $caract = $_POST['txtCaract'];

    if (!empty($dir) && !empty($cp) && !empty($tipo) && !empty($precio) && !empty($serv) && !empty($caract)) {
        
    $modificar=$conexion->query("UPDATE propiedad SET Dir_Propiedad='$dir', CodP='$cp', Tipo_Propiedad='$tipo', Precio_Propiedad='$precio', Serv_Propiedad = '$serv', Caract_Propiedad = '$caract' WHERE ID_Propiedad='$id'");
    if ($modificar==true) {
        echo "<div class='alert alert-success'>Propiedad modificada</div>";
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