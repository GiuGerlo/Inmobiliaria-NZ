<?php

if(!empty($_GET['id'])){
    $id = $_GET["id"];

    $eliminar=$conexion->query("DELETE FROM propiedad where ID_Propiedad = '$id'");

    if ($eliminar) {
        // Notificación de éxito
        $_SESSION['toast'] = [
            'message' => 'Propiedad eliminada correctamente',
            'background' => '#28a745', // Verde para éxito
        ];
    } else {
        // Notificación de error
        $_SESSION['toast'] = [
            'message' => 'Error al eliminar el dueño',
            'background' => '#dc3545', // Rojo para error
        ];
    }?>

    <script>
        window.history.replaceState(null, null, window.location.pathname);
    </script>
    
<?php }