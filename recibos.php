<?php
include("templates/inc.head.php");

?>

<body>
    <!-- FUNCION PARA PREGUNTAR SI ELIMINAR O NO -->
    <script>
        function confirmar() {
            return confirm("¿Desea eliminar el recibo?");
        }
    </script>
    <div class="wrapper">
        <!-- INCLUYO SIDEBAR Y NOTIFICACIONES -->
        <?php
        include("templates/sidebar.php");
        include("templates/toast.php");
        ?>
        <!-- MAIN -->
        <div class="main p-3">
            <div class="text-center h1 fw-bold p-3 pb-0">
                <h1>Recibos</h1>
            </div>
        </div>
        <!-- INCLUYO FOOTER -->
        <?php
        include "templates/inc.footer.php";
        ?>
    </div>
</body>