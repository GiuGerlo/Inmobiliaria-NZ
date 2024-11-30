<?php

if(!empty($_POST["btnModificar"])){
    $id = $_POST['txtId'];
    $nya = $_POST['txtNyA'];
    $cp = $_POST['txtCodP'];
    $tel = $_POST['txtTel'];
    $email = $_POST['txtEmail'];

    if (!empty($nya) && !empty($cp) && !empty($tel) && !empty($email)) {
        
    $modificar=$conexion->query("UPDATE inquilino SET NYA_Inquilino='$nya', CodP='$cp', Tel_Inquilino='$tel', Email_Inquilino='$email' WHERE ID_Inquilino='$id'");
    if ($modificar==true) {
        echo "<div class='alert alert-success'>Inquilino modificado</div>";
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