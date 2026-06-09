<?php
include("templates/inc.head.php");
?>

<body>
    <div class="wrapper">
        <!-- INCLUYO SIDEBAR Y NOTIFICACIONES -->
        <?php
        include("templates/sidebar.php");
        include("templates/toast.php");
        ?>
        
        <!-- MAIN -->
        <div class="main p-3">
            <div class="text-center h1 fw-bold p-3 pb-0">
                <h1>Administración de Alquileres</h1>
            </div>

            <!-- Botonera central -->
            <div class="d-flex flex-column align-items-center justify-content-center mt-5">
                <div class="row gx-4 gy-4">
                    <div class="col-md-4 text-center">
                        <a href="recibos.php" class="btn btn-primary btn-lg w-100 p-4" style="font-size: 1.5rem;">
                            <i class="lni lni-ticket-1 d-block mb-2" style="font-size: 2.5rem;"></i>
                            Recibos
                        </a>
                    </div>
                    <div class="col-md-4 text-center">
                        <a href="contratos.php" class="btn btn-secondary btn-lg w-100 p-4" style="font-size: 1.5rem;">
                            <i class="lni lni-hand-shake d-block mb-2" style="font-size: 2.5rem;"></i>
                            Contratos
                        </a>
                    </div>
                    <div class="col-md-4 text-center">
                        <a href="propiedades.php" class="btn btn-success btn-lg w-100 p-4" style="font-size: 1.5rem;">
                            <i class="lni lni-home-2 d-block mb-2" style="font-size: 2.5rem;"></i>
                            Propiedades
                        </a>
                    </div>
                </div>
                <div class="row gx-4 gy-4 mt-3">
                    <div class="col-md-4 text-center">
                        <a href="ciudades.php" class="btn btn-info btn-lg w-100 p-4" style="font-size: 1.5rem;">
                            <i class="lni lni-buildings-1 d-block mb-2" style="font-size: 2.5rem;"></i>
                            Ciudades
                        </a>
                    </div>
                    <div class="col-md-4 text-center">
                        <a href="inquilinos.php" class="btn btn-warning btn-lg w-100 p-4" style="font-size: 1.5rem;">
                            <i class="fa-regular fa-user d-block mb-2" style="font-size: 2.5rem;"></i>
                            Inquilinos
                        </a>
                    </div>
                    <div class="col-md-4 text-center">
                        <a href="duenos.php" class="btn btn-danger btn-lg w-100 p-4" style="font-size: 1.5rem;">
                            <i class="fa-solid fa-user d-block mb-2" style="font-size: 2.5rem;"></i>
                            Dueños
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- INCLUYO FOOTER -->
        <?php
        include "templates/inc.footer.php";
        ?>
    </div>
</body>
