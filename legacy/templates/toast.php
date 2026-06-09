<?php
    if (isset($_SESSION['toast'])) {
        $toastMessage = $_SESSION['toast']['message'];
        $toastBackground = $_SESSION['toast']['background'];
        echo "
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                Toastify({
                    text: '$toastMessage',
                    duration: 3000,
                    close: true,
                    gravity: 'top',
                    position: 'right',
                    backgroundColor: '$toastBackground',
                }).showToast();
            });
        </script>
    ";
        unset($_SESSION['toast']); // Borra la notificación después de mostrarla
    }
