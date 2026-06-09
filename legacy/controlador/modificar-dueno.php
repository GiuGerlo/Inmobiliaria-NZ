<?php

if(!empty($_POST["btnModificar"])){
    $id = $_POST['txtId'];
    $nya = $_POST['txtNyA'];
    $cp = $_POST['txtCodP'];
    $tel = $_POST['txtTel'];
    $email = $_POST['txtEmail'];

    if (!empty($nya) && !empty($cp) && !empty($tel) && !empty($email)) {
        
    $modificar=$conexion->query("UPDATE dueno SET NYA_Dueno='$nya', CodP='$cp', Tel_Dueno='$tel', Email_Dueno='$email' WHERE ID_Dueno='$id'");
    if ($modificar==true) {
        echo "<div class='alert alert-success'>Dueño modificado</div>";
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
