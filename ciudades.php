<?php
include("templates/inc.head.php");
include("controlador/registrar-ciudad.php");
include("controlador/modificar-ciudad.php");
include("controlador/eliminar-ciudad.php");
?>

<body>
    <!-- FUNCION PARA PREGUNTAR SI ELIMINAR O NO -->
    <script>
        function confirmar() {
            return confirm("¿Desea eliminar al ciudad?");
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
                <h1>Ciudades</h1>
            </div>
            <div class="row p-4">
                <!-- FORMULARIO DE INGRESO -->
                <div class="col-4 p-3 card shadow-sm border-0">
                    <div class="card-body pt-0">
                        <h3 class="text-center text-dark">Registro de ciudades</h3>
                        <form action="" method="post">
                            <!-- CODIGO POSTAL -->
                            <div class="form-group mb-3">
                                <label for="codp" class="form-label">Código Postal</label>
                                <input type="number" class="form-control" id="codp" name="txtCodP">
                            </div>
                            <!-- NOMBRE LOCALIDAD -->
                            <div class="form-group mb-3">
                                <label for="nombreciu" class="form-label">Nombre de la localidad</label>
                                <input type="text" class="form-control" id="nombreciu" name="txtNombre">
                            </div>
                            <!-- PROVINCIA -->
                            <div class="form-group mb-3">
                                <label for="nombreprov" class="form-label">Nombre de la provincia</label>
                                <input type="text" class="form-control" id="nombreprov" name="txtProv">
                            </div>
                            <!-- BOTON DE REGISTRAR -->
                            <button type="submit" name="btnRegistrar" value="OK" class="btn btn-primary w-100">Registrar</button>
                        </form>
                    </div>
                </div>
                <!-- TABLA -->
                <div class="col-8 p-3">
                    <table class="table table-striped table-hover table-bordered" id="tabla-ciudades">
                        <thead class="table-dark text-center">
                            <tr>
                                <th scope="col">Código Postal</th>
                                <th scope="col">Localidad</th>
                                <th scope="col">Provincia</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <!-- CONSULTA A LA DB -->
                            <?php
                            $stmt = $conexion->prepare("SELECT * FROM ciudad");
                            $stmt->execute();
                            $ciudades = $stmt->get_result();
                            while ($datos = $ciudades->fetch_object()) { ?>
                                <tr>
                                    <td><?= $datos->CodP ?></td>
                                    <td><?= $datos->Nombre_Ciudad ?></td>
                                    <td><?= $datos->Provincia ?></td>
                                    <td>
                                        <!-- BOTON PARA ABRIR MODAL -->
                                        <a href="" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#exampleModalLong<?= $datos->CodP ?>">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>
                                        <a href="ciudades.php?id=<?= $datos->CodP ?>" onclick="return confirmar()" class="btn btn-danger">
                                            <i class="fa-solid fa-trash"></i>
                                        </a>
                                    </td>
                                </tr>
                                <!-- MODAL DINÁMICO -->
                                <div class="modal fade" id="exampleModalLong<?= $datos->CodP ?>" tabindex="-1" aria-labelledby="exampleModalLongTitle<?= $datos->CodP ?>" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLongTitle<?= $datos->CodP ?>">Editar ciudad</h5>
                                                <button type="button" class="btn-close btn-cerrar-modal" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <!-- FORMULARIO DE MODIFICACIÓN -->
                                                <form action="" method="post">
                                                    <!-- ID -->
                                                    <div class="form-group mb-3">
                                                        <label for="codp" class="form-label">Código Postal</label>
                                                        <input type="number" class="form-control" id="codp" name="txtCodP" value="<?= $datos->CodP ?>">
                                                    </div>
                                                    <!-- NOMBRE LOCALIDAD -->
                                                    <div class="form-group mb-3">
                                                        <label for="nombreciu" class="form-label">Localidad</label>
                                                        <input type="text" class="form-control" id="nombreciu" name="txtNombre" value="<?= $datos->Nombre_Ciudad ?>">
                                                    </div>
                                                    <!-- PROVINCIA-->
                                                    <div class="form-group mb-3">
                                                        <label for="nombreprov" class="form-label">Email</label>
                                                        <input type="text" class="form-control" id="nombreprov" name="txtProv" value="<?= $datos->Provincia ?>">
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