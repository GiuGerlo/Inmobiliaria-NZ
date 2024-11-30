<?php
include("templates/inc.head.php");
include("controlador/registrar-inquilino.php");
include("controlador/modificar-inquilino.php");
include("controlador/eliminar-inquilino.php");
?>

<body>
    <!-- FUNCION PARA PREGUNTAR SI ELIMINAR O NO -->
    <script>
        function confirmar() {
            return confirm("¿Desea eliminar al inquilino?");
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
                <h1>Inquilinos</h1>
            </div>
            <div class="row p-4">
                <!-- FORMULARIO DE INGRESO -->
                <div class="col-4 p-3 card shadow-sm border-0">
                    <div class="card-body pt-0">
                        <h3 class="text-center text-dark">Registro de inquilinos</h3>
                        <form action="" method="post">
                            <!-- NOMBRE Y APELLIDO -->
                            <div class="form-group mb-3">
                                <label for="nyainquilino" class="form-label">Nombre y apellido</label>
                                <input type="text" class="form-control" id="nyainquilino" name="txtNyA">
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
                                <label for="telinquilino" class="form-label">Teléfono</label>
                                <input type="number" class="form-control" id="telinquilino" name="txtTel">
                            </div>
                            <!-- EMAIL -->
                            <div class="form-group mb-3">
                                <label for="emailinquilino" class="form-label">Email</label>
                                <input type="email" class="form-control" id="emailinquilino" name="txtEmail">
                            </div>
                            <!-- BOTON DE REGISTRAR -->
                            <button type="submit" name="btnRegistrar" value="OK" class="btn btn-primary w-100">Registrar</button>
                        </form>
                    </div>
                </div>
                <!-- TABLA -->
                <div class="col-8 p-3">
                    <table class="table table-striped table-hover table-bordered" id="tabla-inquilinos">
                        <thead class="table-dark text-center">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Nombre y apellido</th>
                                <th scope="col">Localidad</th>
                                <th scope="col">Teléfono</th>
                                <th scope="col">Email</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <!-- CONSULTA A LA DB -->
                            <?php
                            $stmt = $conexion->prepare("SELECT inquilino.*, ciudad.Nombre_Ciudad FROM inquilino INNER JOIN ciudad ON inquilino.CodP = ciudad.CodP ORDER BY ID_Inquilino ASC");
                            $stmt->execute();
                            $inquilinos = $stmt->get_result();
                            while ($datos = $inquilinos->fetch_object()) { ?>
                                <tr>
                                    <td><?= $datos->ID_Inquilino ?></td>
                                    <td><?= $datos->NYA_Inquilino ?></td>
                                    <td><?= $datos->Nombre_Ciudad ?></td>
                                    <td><?= $datos->Tel_Inquilino ?></td>
                                    <td><?= $datos->Email_Inquilino ?></td>
                                    <td>
                                        <!-- BOTON PARA ABRIR MODAL -->
                                        <a href="" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#exampleModalLong<?= $datos->ID_Inquilino ?>">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>
                                        <a href="inquilinos.php?id=<?= $datos->ID_Inquilino ?>" onclick="return confirmar()" class="btn btn-danger">
                                            <i class="fa-solid fa-trash"></i>
                                        </a>
                                    </td>
                                </tr>
                                <!-- MODAL DINAMICO -->
                                <div class="modal fade" id="exampleModalLong<?= $datos->ID_Inquilino ?>" tabindex="-1" aria-labelledby="exampleModalLongTitle<?= $datos->ID_Inquilino ?>" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLongTitle<?= $datos->ID_Inquilino ?>">Editar inquilino</h5>
                                                <button type="button" class="btn-close btn-cerrar-modal" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form action="" method="post">
                                                    <!-- ID OCULTO -->
                                                    <input type="hidden" value="<?= $datos->ID_Inquilino ?>" name="txtId">
                                                    <!-- NOMBRE Y APELLIDO -->
                                                    <div class="form-group mb-3">
                                                        <label for="nyainquilino" class="form-label">Nombre y apellido</label>
                                                        <input type="text" class="form-control" id="nyainquilino" name="txtNyA" value="<?= $datos->NYA_Inquilino ?>">
                                                    </div>
                                                    <!-- LOCALIDAD -->
                                                    <div class="mb-3">
                                                        <label for="codp" class="form-label">Localidad</label>
                                                        <select name="txtCodP" class="form-select" id="codp">
                                                            <option selected>Seleccionar localidad...</option>
                                                            <!-- COMBO BOX DINÁMICO -->
                                                            <?php
                                                            $datosLocalidad = $conexion->query("SELECT * FROM ciudad");
                                                            while ($datosLoc = $datosLocalidad->fetch_object()) { ?>
                                                                <option <?= $datos->CodP == $datosLoc->CodP ? "selected" : "" ?> value="<?= $datosLoc->CodP ?>">
                                                                    <?= $datosLoc->Nombre_Ciudad ?>
                                                                </option>
                                                            <?php }
                                                            ?>
                                                        </select>
                                                    </div>
                                                    <!-- TELEFONO -->
                                                    <div class="form-group mb-3">
                                                        <label for="telinquilino" class="form-label">Teléfono</label>
                                                        <input type="number" class="form-control" id="telinquilino" name="txtTel" value="<?= $datos->Tel_Inquilino ?>">
                                                    </div>
                                                    <!-- EMAIL -->
                                                    <div class="form-group mb-3">
                                                        <label for="emailinquilino" class="form-label">Email</label>
                                                        <input type="email" class="form-control" id="emailinquilino" name="txtEmail" value="<?= $datos->Email_Inquilino ?>">
                                                    </div>
                                                    <!-- BOTON DE EDITAR -->
                                                    <button type="submit" name="btnModificar" value="OK" class="btn btn-primary w-100">Modificar</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <?php }
                            ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <!-- INCLUYO FOOTER -->
        <?php
        include "templates/inc.footer.php";
        ?>
    </div>
</body>