<?php
include("templates/inc.head.php");
include("controlador/registrar-recibo.php");
include("controlador/modificar-recibo.php");
include("controlador/eliminar-recibo.php");
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
            <div class="text-right">
                <a href="controlador/generar-recibo.php" class="btn btn-success">Recibo</a>
            </div>
            <div class="row">
                <div class="col-12 p-3">
                    <table class="table table-striped table-hover table-bordered" id="tabla-recibos">
                        <thead class="table-dark text-center">
                            <tr>
                                <th scope="col">NRO</th>
                                <th scope="col">Contrato</th>
                                <th scope="col">FP</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Pago</th>
                                <th scope="col">Mes</th>
                                <th scope="col">Año</th>
                                <th scope="col">Mun.</th>
                                <th scope="col">Agua</th>
                                <th scope="col">Electr.</th>
                                <th scope="col">Gas</th>
                                <th scope="col">Arreglo</th>
                                <!-- <th scope="col">Com.</th> -->
                                <th scope="col">Sep.</th>
                                <th scope="col">Honor.</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <!-- CONSULTA A LA DB -->
                            <?php
                            $stmt = $conexion->prepare(" SELECT r.*, CONCAT(d.NYA_Dueno, ' - ', i.NYA_Inquilino) AS Contrato_Detalle, d.NYA_Dueno, i.NYA_Inquilino, fp.Desc_FP FROM recibo r INNER JOIN contrato c ON r.ID_Contrato = c.ID_Contrato INNER JOIN inquilino i ON c.ID_Inquilino = i.ID_Inquilino INNER JOIN dueno d ON c.ID_Dueno = d.ID_Dueno INNER JOIN formadepago fp ON r.ID_FP = fp.ID_FP");
                            $stmt->execute();
                            $recibos = $stmt->get_result();
                            while ($datos = $recibos->fetch_object()) { ?>
                                <tr>
                                    <td><?= $datos->Nro_Recibo ?></td>
                                    <td><?= $datos->Contrato_Detalle ?></td>
                                    <td><?= $datos->Desc_FP ?></td>
                                    <td><?= date("d/m/y", strtotime($datos->F_Pago)) ?></td>
                                    <td><?= $datos->Pago_Propiedad ?></td>
                                    <td><?= $datos->Mes_Rend ?></td>
                                    <td><?= $datos->Ano_Rend ?></td>
                                    <td><?= $datos->Pago_Municipal ?></td>
                                    <td><?= $datos->Pago_Agua ?></td>
                                    <td><?= $datos->Pago_Electricidad ?></td>
                                    <td><?= $datos->Pago_Gas ?></td>
                                    <td><?= $datos->Arreglos ?></td>
                                    <!-- <td>// $datos->Comentarios </td> -->
                                    <td><?= $datos->Sepelio ?></td>
                                    <td><?= $datos->Honorarios ?></td>
                                    <td>
                                        <!-- Botón para abrir el modal -->
                                        <a href="" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#exampleModalLong<?= $datos->Nro_Recibo ?>">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </a>
                                        <a href="recibos.php?id=<?= $datos->Nro_Recibo ?>" onclick="return confirmar()" class="btn btn-danger">
                                            <i class="fa-solid fa-trash"></i>
                                        </a>
                                        <a href="controlador/generar-recibo.php?id=<?=$datos->Nro_Recibo?>" class="btn btn-success" target="_blank">Recibo</a>
                                    </td>
                                </tr>
                                <!-- MODAL DINÁMICO -->
                                <div class="modal fade" id="exampleModalLong<?= $datos->Nro_Recibo ?>" tabindex="-1" aria-labelledby="exampleModalLongTitle<?= $datos->Nro_Recibo ?>" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalLongTitle<?= $datos->Nro_Recibo ?>">Editar recibo</h5>
                                                <button type="button" class="btn-close btn-cerrar-modal" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <form action="" method="post">
                                                    <!-- ID OCULTO -->
                                                    <input type="hidden" value="<?= $datos->Nro_Recibo ?>" name="txtId">
                                                    <!-- NOMBRE CONTRATO -->
                                                    <div class="mb-3">
                                                        <label for="contrato_detalle_modal" class="form-label">Contrato</label>
                                                        <select name="txtContrato" class="form-select" id="contrato_detalle_modal">
                                                            <option selected>Seleccionar contrato...</option>
                                                            <!-- COMBO BOX DINÁMICO -->
                                                            <?php
                                                            $contratos = $conexion->query("SELECT c.ID_Contrato, CONCAT(d.NYA_Dueno, ' - ', i.NYA_Inquilino) AS Contrato_Detalle FROM contrato c INNER JOIN dueno d ON c.ID_Dueno = d.ID_Dueno INNER JOIN inquilino i ON c.ID_Inquilino = i.ID_Inquilino");
                                                            while ($datosContrato = $contratos->fetch_object()) { ?>
                                                                <option <?= isset($datos->ID_Contrato) && $datos->ID_Contrato == $datosContrato->ID_Contrato ? "selected" : "" ?>
                                                                    value="<?= $datosContrato->ID_Contrato ?>">
                                                                    <?= $datosContrato->Contrato_Detalle ?>
                                                                </option>
                                                            <?php }
                                                            ?>
                                                        </select>
                                                    </div>
                                                    <!-- FORMA DE PAGO -->
                                                    <div class="mb-3">
                                                        <label for="fp_modal" class="form-label">Forma de pago</label>
                                                        <select name="txtFP" class="form-select" id="fp_modal">
                                                            <option selected>Seleccionar forma de pago...</option>
                                                            <!-- COMBO BOX DINÁMICO -->
                                                            <?php
                                                            $formasdepago = $conexion->query("SELECT * FROM formadepago");
                                                            while ($datosFP = $formasdepago->fetch_object()) { ?>
                                                                <option <?= isset($datos->ID_FP) && $datos->ID_FP == $datosFP->ID_FP ? "selected" : "" ?>
                                                                    value="<?= $datosFP->ID_FP ?>">
                                                                    <?= $datosFP->Desc_FP ?>
                                                                </option>
                                                            <?php }
                                                            ?>
                                                        </select>
                                                    </div>
                                                    <!-- FECHA DE PAGO y PAGO -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="fechadep" class="form-label">Fecha de pago</label>
                                                            <input type="date" class="form-control" id="fechadep" name="txtFecP" value="<?= $datos->F_Pago ?>">
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="pagop" class="form-label">Pago($)</label>
                                                            <input type="number" class="form-control" id="pagop" name="txtPagoP" value="<?= $datos->Pago_Propiedad ?>">
                                                        </div>
                                                    </div>
                                                    <!-- MES Y AÑO RENDIDO -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="mes" class="form-label">Mes rendido</label>
                                                            <select name="txtMes" id="mes" class="form-select">
                                                                <option value="Enero" <?= $datos->Mes_Rend === 'Enero' ? 'selected' : '' ?>>Enero</option>
                                                                <option value="Febrero" <?= $datos->Mes_Rend === 'Febrero' ? 'selected' : '' ?>>Febrero</option>
                                                                <option value="Marzo" <?= $datos->Mes_Rend === 'Marzo' ? 'selected' : '' ?>>Marzo</option>
                                                                <option value="Abril" <?= $datos->Mes_Rend === 'Abril' ? 'selected' : '' ?>>Abril</option>
                                                                <option value="Mayo" <?= $datos->Mes_Rend === 'Mayo' ? 'selected' : '' ?>>Mayo</option>
                                                                <option value="Junio" <?= $datos->Mes_Rend === 'Junio' ? 'selected' : '' ?>>Junio</option>
                                                                <option value="Julio" <?= $datos->Mes_Rend === 'Julio' ? 'selected' : '' ?>>Julio</option>
                                                                <option value="Agosto" <?= $datos->Mes_Rend === 'Agosto' ? 'selected' : '' ?>>Agosto</option>
                                                                <option value="Septiembre" <?= $datos->Mes_Rend === 'Septiembre' ? 'selected' : '' ?>>Septiembre</option>
                                                                <option value="Octubre" <?= $datos->Mes_Rend === 'Octubre' ? 'selected' : '' ?>>Octubre</option>
                                                                <option value="Noviembre" <?= $datos->Mes_Rend === 'Noviembre' ? 'selected' : '' ?>>Noviembre</option>
                                                                <option value="Diciembre" <?= $datos->Mes_Rend === 'Diciembre' ? 'selected' : '' ?>>Diciembre</option>
                                                            </select>
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="ano" class="form-label">Año rendido</label>
                                                            <input type="number" class="form-control" id="ano" name="txtAno" value="<?= $datos->Ano_Rend ?>">
                                                        </div>
                                                    </div>
                                                    <!-- MUNICIPAL Y AGUA -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="municipal" class="form-label">Municipal</label>
                                                            <input type="number" class="form-control" id="municipal" name="txtMunicipal" value="<?= $datos->Pago_Municipal ?>">
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="agua" class="form-label">Agua</label>
                                                            <input type="number" class="form-control" id="agua" name="txtAgua" value="<?= $datos->Pago_Agua ?>">
                                                        </div>
                                                    </div>
                                                    <!-- ELECTRICIDAD Y GAS  -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="electricidad" class="form-label">Electricidad</label>
                                                            <input type="number" class="form-control" id="electricidad" name="txtElectricidad" value="<?= $datos->Pago_Electricidad ?>">
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="gas" class="form-label">Gas</label>
                                                            <input type="number" class="form-control" id="gas" name="txtGas" value="<?= $datos->Pago_Gas ?>">
                                                        </div>
                                                    </div>
                                                    <!-- ARREGLOS Y COMENTARIOS  -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="arreglo" class="form-label">Arreglos($)</label>
                                                            <input type="number" class="form-control" id="arreglo" name="txtArreglo" value="<?= $datos->Arreglos ?>">
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="com" class="form-label">Comentarios</label>
                                                            <input type="text" class="form-control" id="com" name="txtComentarios" value="<?= $datos->Comentarios ?>">
                                                        </div>
                                                    </div>
                                                    <!-- SEPELIO Y HONORARIOS  -->
                                                    <div class="col-12 d-flex justify-content-between">
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="sepelio" class="form-label">Sepelio</label>
                                                            <input type="number" class="form-control" id="sepelio" name="txtSepelio" value="<?= $datos->Sepelio ?>">
                                                        </div>
                                                        <div class="form-group mb-3 p-2 col-6">
                                                            <label for="honorarios" class="form-label">Honorarios</label>
                                                            <input type="number" class="form-control" id="honorarios" name="txtHonorarios" value="<?= $datos->Honorarios ?>">
                                                        </div>
                                                    </div>
                                                    <!-- BOTON DE EDITAR -->
                                                    <button type="submit" name="btnModificar" value="OK" class="btn btn-primary w-100">Modificar</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                </div>
            <?php }
            ?>
                        </tbody>
                    </table>
            </div>
            <!-- FORMULARIO DE INGRESO -->
            <div class="p-3 card shadow-sm border-0">
                <div class="card-body pt-0">
                    <h3 class="text-center text-dark">Registro de recibos</h3>
                    <h6 class="text-center text-dark">En caso de que no haya algun impuesto, indicar 0</h6>
                    <form action="" method="post">
                        <!-- CONTRATO -->
                        <div class="mb-3">
                            <label for="contrato_detalle" class="form-label">Contrato</label>
                            <select name="txtContrato" class="form-select" id="contrato_detalle">
                                <option selected>Seleccionar contrato...</option>
                                <!-- COMBO BOX DINÁMICO -->
                                <?php
                                $contratos = $conexion->query("SELECT c.ID_Contrato, CONCAT(d.NYA_Dueno, ' - ', i.NYA_Inquilino) AS Contrato_Detalle FROM contrato c INNER JOIN dueno d ON c.ID_Dueno = d.ID_Dueno INNER JOIN inquilino i ON c.ID_Inquilino = i.ID_Inquilino");
                                while ($datos = $contratos->fetch_object()) { ?>
                                    <option value="<?= $datos->ID_Contrato ?>"><?= $datos->Contrato_Detalle ?></option>
                                <?php }
                                ?>
                            </select>
                        </div>
                        <!-- FORMA DE PAGO -->
                        <div class="mb-3">
                            <label for="fp" class="form-label">Forma de pago</label>
                            <select name="txtFP" class="form-select" id="fp">
                                <option selected>Seleccionar forma de pago...</option>
                                <!-- COMBO BOX DINÁMICO -->
                                <?php
                                $formasdepago = $conexion->query("SELECT * FROM formadepago");
                                while ($datos = $formasdepago->fetch_object()) { ?>
                                    <option value="<?= $datos->ID_FP ?>"><?= $datos->Desc_FP ?></option>
                                <?php }
                                ?>
                            </select>
                        </div>
                        <!-- FECHA DE PAGO y PAGO -->
                        <div class="col-12 d-flex justify-content-between">
                            <div class="form-group mb-3 p-2 col-6">
                                <label for="fechadep" class="form-label">Fecha de pago</label>
                                <input type="date" class="form-control" id="fechadep" name="txtFecP">
                            </div>
                            <div class="form-group mb-3 p-2 col-6">
                                <label for="pagop" class="form-label">Pago($)</label>
                                <input type="number" class="form-control" id="pagop" name="txtPagoP">
                            </div>
                        </div>
                        <!-- MES y AÑO -->
                        <div class="col-12 d-flex justify-content-between">
                            <div class="form-group mb-3 p-2 col-6">
                                <label for="mes" class="form-label">Mes rendido</label>
                                <select name="txtMes" id="mes" class="form-select">
                                    <option selected>Seleccionar mes...</option>
                                    <option value="Enero">Enero</option>
                                    <option value="Febrero">Febrero</option>
                                    <option value="Marzo">Marzo</option>
                                    <option value="Abril">Abril</option>
                                    <option value="Mayo">Mayo</option>
                                    <option value="Junio">Junio</option>
                                    <option value="Julio">Julio</option>
                                    <option value="Agosto">Agosto</option>
                                    <option value="Septiembre">Septiembre</option>
                                    <option value="Octubre">Octubre</option>
                                    <option value="Noviembre">Noviembre</option>
                                    <option value="Diciembre">Diciembre</option>
                                </select>
                            </div>
                            <div class="form-group mb-3 p-2 col-6">
                                <label for="ano" class="form-label">Año rendido</label>
                                <input type="number" class="form-control" id="ano" name="txtAno">
                            </div>
                        </div>
                        <!-- MUNICIPAL, AGUA, ELECTRICIDAD, GAS -->
                        <div class="col-12 d-flex justify-content-between">
                            <div class="form-group mb-3 p-2 col-3">
                                <label for="municipal" class="form-label">Municipal</label>
                                <input type="number" class="form-control" id="municipal" name="txtMunicipal">
                            </div>
                            <div class="form-group mb-3 p-2 col-3">
                                <label for="agua" class="form-label">Agua</label>
                                <input type="number" class="form-control" id="agua" name="txtAgua">
                            </div>
                            <div class="form-group mb-3 p-2 col-3">
                                <label for="electricidad" class="form-label">Electricidad</label>
                                <input type="number" class="form-control" id="electricidad" name="txtElectricidad">
                            </div>
                            <div class="form-group mb-3 p-2 col-3">
                                <label for="gas" class="form-label">Gas</label>
                                <input type="number" class="form-control" id="gas" name="txtGas">
                            </div>
                        </div>
                        <!-- ARREGLOS Y COMENTARIOS -->
                        <div class="col-12 d-flex justify-content-between">
                            <div class="form-group mb-3 p-2 col-6">
                                <label for="arreglo" class="form-label">Arreglos($)</label>
                                <input type="number" class="form-control" id="arreglo" name="txtArreglo">
                            </div>
                            <div class="form-group mb-3 p-2 col-6">
                                <label for="com" class="form-label">Comentarios</label>
                                <input type="text" class="form-control" id="com" name="txtComentarios">
                            </div>
                        </div>
                        <!-- SEPELIO Y HONORARIOS -->
                        <div class="col-12 d-flex justify-content-between">
                            <div class="form-group mb-3 p-2 col-6">
                                <label for="sepelio" class="form-label">Sepelio</label>
                                <input type="number" class="form-control" id="sepelio" name="txtSepelio">
                            </div>
                            <div class="form-group mb-3 p-2 col-6">
                                <label for="honorarios" class="form-label">Honorarios</label>
                                <input type="number" class="form-control" id="honorarios" name="txtHonorarios">
                            </div>
                        </div>
                        <!-- BOTON DE REGISTRAR -->
                        <button type="submit" name="btnRegistrar" value="OK" class="btn btn-primary w-100">Registrar</button>
                    </form>
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