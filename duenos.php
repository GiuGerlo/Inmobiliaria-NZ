<?php
include("templates/inc.head.php");
include("controlador/modificar-dueno.php");
include("controlador/registrar-dueno.php");
?>

<body>

    <div class="wrapper">
        <!-- INCLUYO SIDEBAR Y NOTIFICACIONES -->
        <?php
        include "templates/sidebar.php";
        include "templates/toast.php";
        ?>
        <!-- MAIN -->
        <div class="main p-3">
            <div class="text-center h1 fw-bold p-3 pb-0">
                <h1>Dueños</h1>
            </div>
            <div class="row p-4">
                <!-- FORMULARIO DE INGRESO -->
                <div class="col-4 p-3 card shadow-sm border-0">
                    <div class="card-body pt-0">
                        <h3 class="text-center text-dark">Registro de dueños</h3>
                        <form action="" method="post">
                            <!-- NOMBRE Y APELLIDO -->
                            <div class="form-group mb-3">
                                <label for="nyadueno" class="form-label">Nombre y apellido</label>
                                <input type="text" class="form-control" id="nyadueno" name="txtNyA">
                            </div>
                            <!-- LOCALIDAD -->
                            <div class="mb-3">
                                <label for="codp" class="form-label">Localidad</label>
                                <select name="txtCodP" class="form-select" id="codp">
                                    <option selected>Seleccionar localidad...</option>
                                    <!-- COMBO BOX DINÁMICO -->
                                    <?php
                                    $localidades = $conexion->query("SELECT * FROM ciudad");
                                    while ($datos = $localidades->fetch_object()) { ?>
                                        <option value="<?= $datos->CodP ?>"><?= $datos->Nombre_Ciudad ?></option>
                                    <?php }
                                    ?>
                                </select>
                            </div>
                            <!-- TELEFONO -->
                            <div class="form-group mb-3">
                                <label for="teldueno" class="form-label">Teléfono</label>
                                <input type="number" class="form-control" id="teldueno" name="txtTel">
                            </div>
                            <!-- EMAIL -->
                            <div class="form-group mb-3">
                                <label for="emaildueno" class="form-label">Email</label>
                                <input type="email" class="form-control" id="emaildueno" name="txtEmail">
                            </div>
                            <!-- BOTON DE REGISTRAR -->
                            <button type="submit" name="btnRegistrar" value="OK" class="btn btn-primary w-100">Registrar</button>
                        </form>
                    </div>
                </div>
                <!-- TABLA -->
                <div class="col-8 p-3">

                </div>
            </div>
        </div>
    </div>
    <!-- INCLUYO FOOTER -->
    <?php
    include "templates/inc.footer.php"
    ?>
</body>

</html>