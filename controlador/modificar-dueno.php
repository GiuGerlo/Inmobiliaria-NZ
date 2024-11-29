<?php

if (!empty($_POST["btnMODIFICAR"])) {

    $id = $_POST['txtID']; // El ID del dueño a modificar
    $nya = $_POST['txtNYA'];
    $cp = $_POST['txtCODP'];
    $tel = $_POST['txtTEL'];
    $email = $_POST['txtEMAIL'];

    if (!empty($id) && !empty($nya) && !empty($cp) && !empty($tel) && !empty($email)) {
        // Preparar la consulta de actualización para evitar inyecciones SQL
        $stmt = $conexion->prepare("
            UPDATE dueno 
            SET NYA_Dueno = ?, CodP = ?, Tel_Dueno = ?, Email_Dueno = ? 
            WHERE ID_Dueno = ?
        ");
        $stmt->bind_param("ssssi", $nya, $cp, $tel, $email, $id);

        if ($stmt->execute()) {
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
        $stmt->close();
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

    // Redirigir a la vista duenos.php
    header("Location: http://localhost/Inmobiliaria-NZ/duenos.php");
    exit();
}