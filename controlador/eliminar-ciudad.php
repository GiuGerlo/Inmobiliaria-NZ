<?php

if(!empty($_GET['id'])){
    $cp = $_GET["id"];

    $eliminar=$conexion->query("DELETE FROM ciudad where CodP = '$cp'");

    if ($eliminar) {
        // Notificación de éxito
        $_SESSION['toast'] = [
            'message' => 'Ciudad eliminada correctamente',
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