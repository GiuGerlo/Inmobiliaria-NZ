<?php
include("templates/inc.head.php");
include("controlador/registrar-contrato.php");
include("controlador/modificar-contrato.php");
include("controlador/eliminar-contrato.php");
?>

<body>
    <!-- FUNCION PARA PREGUNTAR SI ELIMINAR O NO -->
    <script>
        function confirmar() {
            return confirm("¿Desea eliminar el contrato?");
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
                <h1>Contratos</h1>
            </div>
            <div class="row p-4">
                <!-- FORMULARIO DE INGRESO -->
                <div class="col-3 p-3 card shadow-sm border-0">
                    <div class="card-body pt-0">
                        <h3 class="text-center text-dark">Registro de contratos</h3>
                        <form action="" method="post">
                            <!-- NOMBRE DUEÑO -->
                            <div class="mb-3">
                                <label for="nyadueno" class="form-label">Dueño</label>
                                <select name="txtDueno" class="form-select" id="nyadueno">
                                    <option selected>Seleccionar dueño...</option>
                                    <!-- COMBO BOX DINÁMICO -->
                                    <?php
                                    $duenos = $conexion->query("SELECT * FROM dueno");
                                    while ($datos = $duenos->fetch_object()) { ?>
                                        <option value="<?= $datos->ID_Dueno ?>"><?= $datos->NYA_Dueno ?></option>
                                    <?php }
                                    ?>
                                </select>
                            </div>
                            <!-- NOMBRE INQUILINO -->
                            <div class="mb-3">
                                <label for="nyainquilino" class="form-label">Inquilino</label>
                                <select name="txtInquilino" class="form-select" id="nyainquilino">
                                    <option selected>Seleccionar inquilino...</option>
                                    <!-- COMBO BOX DINÁMICO -->
                                    <?php
                                    $inquilinos = $conexion->query("SELECT * FROM inquilino");
                                    while ($datos = $inquilinos->fetch_object()) { ?>
                                        <option value="<?= $datos->ID_Inquilino ?>"><?= $datos->NYA_Inquilino ?></option>
                                    <?php }
                                    ?>
                                </select>
                            </div>
                            <!-- DIRECCIÓN PROPIEDAD -->
                            <div class="mb-3">
                                <label for="dirpropiedad" class="form-label">Propiedad</label>
                                <select name="txtPropiedad" class="form-select" id="dirpropiedad">
                                    <option selected>Seleccionar dirección...</option>
                                    <!-- COMBO BOX DINÁMICO -->
                                    <?php
                                    $propiedades = $conexion->query("SELECT * FROM propiedad");
                                    while ($datos = $propiedades->fetch_object()) { ?>
                                        <option value="<?= $datos->ID_Propiedad ?>"><?= $datos->Dir_Propiedad ?></option>
                                    <?php }
                                    ?>
                                </select>
                            </div>
                            <!-- INICIO y FIN -->
                            <div class="col-12 d-flex justify-content-between">
                                <div class="form-group mb-3 p-2 col-6">
                                    <label for="finicio" class="form-label">Inicio</label>
                                    <input type="date" class="form-control" id="finicio" name="txtInicio">
                                </div>
                                <div class="form-group mb-3 p-2 col-6">
                                    <label for="ffin" class="form-label">Fin</label>
                                    <input type="date" class="form-control" id="ffin" name="txtFin">
                                </div>
                            </div>
                            <!-- SALDO y CERTIFICACION -->
                            <div class="col-12 d-flex justify-content-between">
                                <div class="form-group mb-3 p-2 col-6">
                                    <label for="saldo" class="form-label">Saldo</label>
                                    <input type="number" class="form-control" id="saldo" name="txtSaldo">
                                </div>
                                <div class="form-group mb-3 p-2 col-6">
                                    <label for="cert" class="form-label">Certificación</label>
                                    <select name="txtCert" id="text" class="form-select">
                                        <option value="Si" selected>Si</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </div>
                            <!-- BOTON DE REGISTRAR -->
                            <button type="submit" name="btnRegistrar" value="OK" class="btn btn-primary w-100">Registrar</button>
                        </form>
                    </div>
                </div>
                <!-- TABLA -->
                <div class="col-9 p-3">
                    <table class="table table-striped table-hover table-bordered" id="tabla-contratos">
                        <thead class="table-dark text-center">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Dueño</th>
                                <th scope="col">Inquilino</th>
                                <th scope="col">Direccion</th>
                                <th scope="col">Inicio</th>
                                <th scope="col">Fin</th>
                                <th scope="col">Saldo</th>
                                <th scope="col">Cert.</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <!-- CONSULTA A LA DB -->
                            <?php
                            $stmt = $conexion->prepare(" SELECT c.*, p.Dir_Propiedad, d.NYA_Dueno, i.NYA_Inquilino FROM contrato c
                                                        INNER JOIN propiedad p ON c.ID_Propiedad = p.ID_Propiedad
                                                        INNER JOIN dueno d ON c.ID_Dueno = d.ID_Dueno
                                                        INNER JOIN inquilino i ON c.ID_Inquilino = i.ID_Inquilino");
                            $stmt->execute();
                            $contratos = $stmt->get_result();
                            while ($datos = $contratos->fetch_object()) { ?>
                                <tr>
                                    <td><?= $datos->ID_Contrato ?></td>
                                    <td><?= $datos->NYA_Dueno ?></td>
                                    <td><?= $datos->NYA_Inquilino ?></td>
                                    <td><?= $datos->Dir_Propiedad ?></td>
                                    <td><?= $datos->F_Inicio ?></td>
                                    <td><?= $datos->F_Fin ?></td>
                                    <td><?= $datos->Saldo ?></td>
                                    <td><?= $datos->Certificacion ?></td>
                                    <td>
                                        <!-- Botón para abrir el modal -->
                                        <a href="" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#exampleModalLong<?= $datos->ID_Contrato ?>">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>
                                        <a href="contratos.php?id=<?= $datos->ID_Contrato ?>" onclick="return confirmar()" class="btn btn-danger">
                                            <i class="fa-solid fa-trash"></i>
                                        </a>
                                    </td>
                                </tr>
                                <!-- MODAL DINÁMICO -->
                                <div class="modal fade" id="exampleModalLong<?= $datos->ID_Contrato ?>" tabindex="-1" aria-labelledby="exampleModalLongTitle<?= $datos->ID_Contrato ?>" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLongTitle<?= $datos->ID_Contrato ?>">Editar contrato</h5>
                                                <button type="button" class="btn-close btn-cerrar-modal" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form action="" method="post">
                                                    <!-- ID OCULTO -->
                                                    <input type="hidden" value="<?= $datos->ID_Contrato ?>" name="txtId">
                                                    <!-- NOMBRE DUEÑO -->
                                                    <div class="mb-3">
                                                        <label for="nyadueno" class="form-label">Dueño</label>
                                                        <select name="txtDueno" class="form-select" id="nyadueno">
                                                            <option selected>Seleccionar dueño...</option>
                                                            <!-- COMBO BOX DINÁMICO -->
                                                            <?php
                                                            $datosDuenos = $conexion->query("SELECT * FROM dueno");
                                                            while ($datosDue = $datosDuenos->fetch_object()) { ?>
                                                                <option <?= $datos->ID_Dueno == $datosDue->ID_Dueno ? "selected" : "" ?> value="<?= $datosDue->ID_Dueno ?>">
                                                                    <?= $datosDue->NYA_Dueno ?>
                                                                </option>
                                                            <?php }
                                                            ?>
                                                        </select>
                                                    </div>
                                                    <!-- NOMBRE INQUILINO -->
                                                    <div class="mb-3">
                                                        <label for="nyainquilino" class="form-label">Inquilino</label>
                                                        <select name="txtInquilino" class="form-select" id="nyainquilino">
                                                            <option selected>Seleccionar inquilino...</option>
                                                            <!-- COMBO BOX DINÁMICO -->
                                                            <?php
                                                            $datosInquilinos = $conexion->query("SELECT * FROM inquilino");
                                                            while ($datosInq = $datosInquilinos->fetch_object()) { ?>
                                                                <option <?= $datos->ID_Inquilino == $datosInq->ID_Inquilino ? "selected" : "" ?> value="<?= $datosInq->ID_Inquilino ?>">
                                                                    <?= $datosInq->NYA_Inquilino ?>
                                                                </option>
                                                            <?php }
                                                            ?>
                                                        </select>
                                                    </div>
                                                    <!-- DIRECCIÓN -->
                                                    <div class="mb-3">
                                                        <label for="dirpropiedad" class="form-label">Dirección</label>
                                                        <select name="txtPropiedad" class="form-select" id="dirpropiedad">
                                                            <option selected>Seleccionar dirección...</option>
                                                            <!-- COMBO BOX DINÁMICO -->
                                                            <?php
                                                            $datosPropiedades = $conexion->query("SELECT * FROM propiedad");
                                                            while ($datosProp = $datosPropiedades->fetch_object()) { ?>
                                                                <option <?= $datos->ID_Propiedad == $datosProp->ID_Propiedad ? "selected" : "" ?> value="<?= $datosProp->ID_Propiedad ?>">
                                                                    <?= $datosProp->Dir_Propiedad ?>
                                                                </option>
                                                            <?php }
                                                            ?>
                                                        </select>
                                                    </div>
                                                    <!-- INICIO y FIN -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="finicio" class="form-label">Inicio</label>
                                                            <input type="date" class="form-control" id="finicio" name="txtInicio" value="<?= $datos->F_Inicio ?>">
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="ffin" class="form-label">Fin</label>
                                                            <input type="date" class="form-control" id="ffin" name="txtFin" value="<?= $datos->F_Fin ?>">
                                                        </div>
                                                    </div>
                                                    <!-- SALDO y CERTIFICACION -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="saldo" class="form-label">Saldo</label>
                                                            <input type="number" class="form-control" id="saldo" name="txtSaldo" value="<?= $datos->Saldo ?>">
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="cert" class="form-label">Certificación</label>
                                                            <select name="txtCert" id="text" class="form-select">
                                                                <option value="Si" <?= $datos->Certificacion === 'Si' ? 'selected' : '' ?>>Si</option>
                                                                <option value="No" <?= $datos->Certificacion === 'No' ? 'selected' : '' ?>>No</option>
                                                            </select>
                                                        </div>
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