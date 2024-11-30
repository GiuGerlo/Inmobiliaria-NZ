<?php

if(!empty($_POST["btnModificar"])){
    $cp = $_POST['txtCodP'];
    $ciudad = $_POST['txtNombre'];

    if (!empty($cp) && !empty($ciudad)) {
        
    $modificar=$conexion->query("UPDATE ciudad SET CodP='$cp', Nombre_Ciudad='$ciudad' WHERE CodP='$cp'");
    if ($modificar==true) {
        echo "<div class='alert alert-success'>Ciudad modificada</div>";
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