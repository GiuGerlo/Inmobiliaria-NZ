<?php

if (!empty($_POST['btnREGISTRAR'])) {
    $nya = $_POST['txtNYA'];
    $cp = $_POST['txtCODP'];
    $tel = $_POST['txtTEL'];
    $email = $_POST['txtEMAIL'];

    if (!empty($nya) && !empty($cp) && !empty($tel) && !empty($email)) {
        $registrar = $conexion->query("INSERT INTO dueno( NYA_Dueno, CodP, Tel_Dueno, Email_Dueno) values('$nya','$cp','$tel', '$email')");

        if ($registrar == true) {
            // Notificación de éxito
            echo "
                <script>
                    Toastify({
                        text: 'Dueño registrado correctamente',
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
                        text: 'Error al registrar el dueño',
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
?>
