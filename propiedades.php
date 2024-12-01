<?php
include("templates/inc.head.php");
include("controlador/registrar-propiedad.php");
include("controlador/modificar-propiedad.php");
include("controlador/eliminar-propiedad.php");
?>

<body>
    <!-- FUNCION PARA PREGUNTAR SI ELIMINAR O NO -->
    <script>
        function confirmar() {
            return confirm("¿Desea eliminar la propiedad?");
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
                <h1>Propiedades</h1>
            </div>
            <div class="row p-4">
                <!-- FORMULARIO DE INGRESO -->
                <div class="col-4 p-3 card shadow-sm border-0">
                    <div class="card-body pt-0">
                        <h3 class="text-center text-dark">Registro de propiedades</h3>
                        <form action="" method="post">
                            <!-- DIRECCIÓN -->
                            <div class="form-group mb-3">
                                <label for="direccionp" class="form-label">Dirección</label>
                                <input type="text" class="form-control" id="direccionp" name="txtDir">
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
                            <!-- TIPO y PRECIO -->
                            <div class="col-12 d-flex justify-content-between">
                                <div class="form-group mb-3 p-2 col-6">
                                    <label for="tipop" class="form-label">Tipo</label>
                                    <input type="text" class="form-control" id="tipop" name="txtTipo">
                                </div>
                                <div class="form-group mb-3 p-2 col-6">
                                    <label for="preciop" class="form-label">Precio</label>
                                    <input type="number" class="form-control" id="preciop" name="txtPrecio">
                                </div>
                            </div>
                            <!-- SERVICIOS -->
                            <div class="form-group mb-3">
                                <label for="servp" class="form-label">Servicios</label>
                                <input type="text" class="form-control" id="servp" name="txtServ">
                            </div>
                            <!-- CARACTERÍSTICAS -->
                            <div class="form-group mb-3">
                                <label for="caractp" class="form-label">Características</label>
                                <input type="text" class="form-control" id="caractp" name="txtCaract">
                            </div>
                            <!-- FOTO -->
                            <!-- <div class="form-group mb-3">
                                <label for="fotop" class="form-label">Foto</label>
                                <input type="file" class="form-control" id="fotop" name="txtFoto">
                            </div> -->
                            <!-- BOTON DE REGISTRAR -->
                            <button type="submit" name="btnRegistrar" value="OK" class="btn btn-primary w-100">Registrar</button>
                        </form>
                    </div>
                </div>
                <!-- TABLA -->
                <div class="col-8 p-3">
                    <table class="table table-striped table-hover table-bordered" id="tabla-propiedades">
                        <thead class="table-dark text-center">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Dirección</th>
                                <th scope="col">Localidad</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Precio</th>
                                <th scope="col">Servicios</th>
                                <th scope="col">Caracteristicas</th>
                                <!-- <th scope="col">Foto</th> -->
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="text-left">
                            <!-- CONSULTA A LA DB -->
                            <?php
                            $stmt = $conexion->prepare("SELECT propiedad.*, ciudad.Nombre_Ciudad FROM propiedad INNER JOIN ciudad ON propiedad.CodP = ciudad.CodP ORDER BY ID_Propiedad ASC");
                            $stmt->execute();
                            $propiedades = $stmt->get_result();
                            while ($datos = $propiedades->fetch_object()) { ?>
                                <tr>
                                    <td><?= $datos->ID_Propiedad ?></td>
                                    <td><?= $datos->Dir_Propiedad ?></td>
                                    <td><?= $datos->Nombre_Ciudad ?></td>
                                    <td><?= $datos->Tipo_Propiedad ?></td>
                                    <td><?= $datos->Precio_Propiedad ?></td>
                                    <td><?= $datos->Serv_Propiedad ?></td>
                                    <td><?= $datos->Caract_Propiedad ?></td>
                                    <!-- <td>// $datos->Foto_Propiedad </td> -->
                                    <td>
                                        <!-- Botón para abrir el modal -->
                                        <a href="" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#exampleModalLong<?= $datos->ID_Propiedad ?>">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>
                                        <a href="propiedades.php?id=<?= $datos->ID_Propiedad ?>" onclick="return confirmar()" class="btn btn-danger">
                                            <i class="fa-solid fa-trash"></i>
                                        </a>
                                    </td>
                                </tr>
                                <!-- MODAL DINÁMICO -->
                                <div class="modal fade" id="exampleModalLong<?= $datos->ID_Propiedad ?>" tabindex="-1" aria-labelledby="exampleModalLongTitle<?= $datos->ID_Propiedad ?>" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLongTitle<?= $datos->ID_Propiedad ?>">Editar propiedad</h5>
                                                <button type="button" class="btn-close btn-cerrar-modal" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form action="" method="post">
                                                    <!-- ID OCULTO -->
                                                    <input type="hidden" value="<?= $datos->ID_Propiedad ?>" name="txtId">
                                                    <!-- DIRECCIÓN -->
                                                    <div class="form-group mb-3">
                                                        <label for="direccionp" class="form-label">Dirección</label>
                                                        <input type="text" class="form-control" id="direccionp" name="txtDir" value="<?= $datos->Dir_Propiedad ?>">
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
                                                    <!-- TIPO y PRECIO -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="tipop" class="form-label">Tipo</label>
                                                            <input type="text" class="form-control" id="tipop" name="txtTipo" value="<?= $datos->Tipo_Propiedad ?>">
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="preciop" class="form-label">Precio</label>
                                                            <input type="number" class="form-control" id="preciop" name="txtPrecio" value="<?= $datos->Precio_Propiedad ?>">
                                                        </div>
                                                    </div>
                                                    <!-- SERVICIOS -->
                                                    <div class="form-group mb-3">
                                                        <label for="servp" class="form-label">Servicios</label>
                                                        <input type="text" class="form-control" id="servp" name="txtServ" value="<?= $datos->Serv_Propiedad ?>">
                                                    </div>
                                                    <!-- CARACTERÍSTICAS -->
                                                    <div class="form-group mb-3">
                                                        <label for="caractp" class="form-label">Características</label>
                                                        <input type="text" class="form-control" id="caractp" name="txtCaract" value="<?= $datos->Caract_Propiedad ?>">
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