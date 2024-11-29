<?php

if (!empty($_POST["btnMODIFICAR"])) {

    $id = $_POST['txtID']; // El ID del dueño a modificar
    $nya = $_POST['txtNYA'];
    $cp = $_POST['txtCODP'];
    $tel = $_POST['txtTEL'];
    $email = $_POST['txtEMAIL'];

    if (!empty($id) && !empty($nya) && !empty($cp) && !empty($tel) && !empty($email)) {
        // Consulta de actualización
        $modificar = $conexion->query("
            UPDATE dueno 
            SET NYA_Dueno = '$nya', CodP = '$cp', Tel_Dueno = '$tel', Email_Dueno = '$email' 
            WHERE ID_Dueno = '$id'
        ");

        if ($modificar == true) {
            // Notificación de éxito
            echo "
                <script>
                    Toastify({
                        text: 'Dueño modificado correctamente',
                        duration: 3000,
                        close: true,
                        gravity: 'top',
                        position: 'right',
                        backgroundColor: '#28a745',
                    }).showToast();
                </script>
            ";
        } else {
            // Notificación de error en la base de datos
            echo "
                <script>
                    Toastify({
                        text: 'Error al modificar el dueño',
                        duration: 3000,
                        close: true,
                        gravity: 'top',
                        position: 'right',
                        backgroundColor: '#dc3545',
                    }).showToast();
                </script>
            ";
        }
    } else {
        // Notificación de datos faltantes
        echo "
            <script>
                Toastify({
                    text: 'Faltaron datos por ingresar, inténtalo de nuevo',
                    duration: 3000,
                    close: true,
                    gravity: 'top',
                    position: 'right',
                    backgroundColor: '#ffc107',
                }).showToast();
            </script>
        ";
    }

    // Limpia el estado del formulario al recargar
    echo "
        <script>
            window.history.replaceState(null, null, window.location.pathname);
        </script>
    ";
}
