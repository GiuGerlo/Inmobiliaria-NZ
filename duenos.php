<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="./assets/logo.ico" type="image/x-icon">
    <title>Dueños - NZ</title>
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FONT-AWESOME -->
    <script src="https://kit.fontawesome.com/4f18558b97.js" crossorigin="anonymous"></script>
    <!-- LINEICONS -->
    <link href="https://cdn.lineicons.com/5.0/lineicons.css" rel="stylesheet" />
    <!-- TOASTIFY -->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
    <!-- SWEET ALERT -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- CSS -->
    <link rel="stylesheet" href="./styles/styles.css">
</head>

<body>

    <div class="wrapper">
        <aside id="sidebar">
            <div class="d-flex">
                <button id="toggle-btn" type="button">
                    <i class="lni lni-menu-hamburger-1"></i>
                </button>
                <div class="sidebar-logo">
                    <a href="./admin.php">NZ</a>
                </div>
            </div>
            <ul class="sidebar-nav">
                <li class="sidebar-item">
                    <a href="./propiedades.php" class="sidebar-link">
                        <i class="lni lni-home-2"></i>
                        <span>Propiedades</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="./recibos.php" class="sidebar-link">
                        <i class="lni lni-ticket-1"></i>
                        <span>Recibos</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="./contratos.php" class="sidebar-link">
                        <i class="lni lni-hand-shake"></i>
                        <span>Contratos</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link">
                        <i class="fa-solid fa-user"></i>
                        <span>Dueños</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="./inquilinos.php" class="sidebar-link">
                        <i class="fa-regular fa-user"></i>
                        <span>Inquilinos</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="./ciudades.php" class="sidebar-link">
                        <i class="lni lni-buildings-1"></i>
                        <span>Ciudades</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="./fp.php" class="sidebar-link">
                        <i class="lni lni-refresh-dollar-1"></i>
                        <span>Formas de Pago</span>
                    </a>
                </li>
            </ul>
            <div class="sidebar-footer">
                <a href="./logout.php" class="sidebar-link">
                    <i class="lni lni-exit"></i>
                    <span>Cerrar sesión</span>
                </a>
            </div>
        </aside>
        <div class="main p-3">
            <div class="text-center h1 fw-bold p-3 pb-0">
                <h1>Dueños</h1>
            </div>
            <div class="row p-4">
                <!-- Formulario de ingreso -->
                <div class="col-4 p-3 card shadow-sm border-0">
                    <div class="card-body pt-0">
                        <h3 class="text-center text-dark">Registro de dueños</h3>
                        <!-- NOTIFICACIONES -->
                        <?php
                            include ("./modelo/conexion.php");
                            include ("./controlador/registrar-dueno.php")
                        ?>
                        <form action="" method="post">
                            <!-- NOMBRE Y APELLIDO -->
                            <div class="form-group mb-3">
                                <label class="form-label" for="nyadueno">Nombre y apellido</label>
                                <input type="text" class="form-control" id="nyadueno" name="txtNYA">
                            </div>
                            <!-- LOCALIDAD -->
                            <div class="mb-3">
                                <label class="form-label" for="codp">Localidad</label>
                                <select class="form-select" name="txtCODP" id="codp">
                                    <option selected>Seleccionar localidad..</option>
                                    <?php

                                        include("modelo/conexion.php");
                                        $localidades=$conexion->query("SELECT * FROM ciudad");
                                        while ($datos=$localidades->fetch_object()) { ?>
                                            
                                            <option value="<?= $datos->CodP ?>"><?= $datos->Nombre_Ciudad ?></option>

                                        <?php }
                                    ?>
                                </select>
                            </div>
                            <!-- TELEFONO -->
                            <div class="form-group mb-2">
                                <label class="form-label" for="teldueno">Teléfono</label>
                                <input type="number" class="form-control" id="teldueno" name="txtTEL" maxlength="12">
                            </div>
                            <!-- EMAIL -->
                            <div class="form-group mb-3">
                                <label class="form-label" for="emaildueno">Email</label>
                                <input type="email" class="form-control" id="emaildueno" name="textEMAIL">
                            </div>
                            <button type="submit" name="btnREGISTRAR" value="OK" class="btn btn-primary w-100">Registrar</button>
                        </form>
                    </div>
                </div>

                <!-- TABLA -->
                <div class="col-8 p-3">
                    <table class="table table-striped table-hover table-bordered">
                        <thead class="table-dark text-center">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Nombre y apellido</th>
                                <th scope="col">Localidad</th>
                                <th scope="col">Telefono</th>
                                <th scope="col">Email</th>
                            </tr>
                        </thead>
                        <tbody class="text-center">
                            <!-- CONSULTA A LA DB -->
                            <?php
                            include("./modelo/conexion.php");
                            $duenos = $conexion->query("SELECT dueno.*, ciudad.Nombre_Ciudad FROM dueno 
                                                        INNER JOIN ciudad 
                                                        ON dueno.CodP = ciudad.CodP;");
                            while ($datos = $duenos->fetch_object()) { ?>

                                <tr>
                                    <td><?= $datos->ID_Dueno ?></td>
                                    <td><?= $datos->NYA_Dueno ?></td>
                                    <td><?= $datos->Nombre_Ciudad ?></td>
                                    <td><?= $datos->Tel_Dueno ?></td>
                                    <td><?= $datos->Email_Dueno ?></td>
                                    <td>
                                        <a href="" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#exampleModal"><i class="fa-solid fa-pen-to-square"></i></a>
                                        <a href="" class="btn btn-danger"><i class="fa-solid fa-trash"></i></a>
                                    </td>
                                </tr>

                                <!-- Modal editar -->
                                <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h1 class="modal-title fs-5" id="exampleModalLabel">Editar dueño</h1>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div class="modal-body">
                                                <!-- FORMULARIO -->
                                                <form action="">
                                                    <!-- NOMBRE Y APELLIDO -->
                                                    <div class="form-group mb-3">
                                                        <label class="form-label" for="nyadueno">Nombre y apellido</label>
                                                        <input type="text" class="form-control" id="nyadueno" name="txyNYA">
                                                    </div>
                                                    <!-- LOCALIDAD -->
                                                    <div class="mb-3">
                                                        <label class="form-label" for="codp">Localidad</label>
                                                        <select class="form-select" name="txtCODP" id="codp">
                                                            <option selected>Seleccionar localidad..</option>
                                                            <option value="1">One</option>
                                                            <option value="2">Two</option>
                                                            <option value="3">Three</option>
                                                        </select>
                                                    </div>
                                                    <!-- TELEFONO -->
                                                    <div class="form-group mb-2">
                                                        <label class="form-label" for="teldueno">Teléfono</label>
                                                        <input type="number" class="form-control" id="teldueno" name="txtTEL" maxlength="12">
                                                    </div>
                                                    <!-- EMAIL -->
                                                    <div class="form-group mb-3">
                                                        <label class="form-label" for="emaildueno">Email</label>
                                                        <input type="email" class="form-control" id="emaildueno" name="textEMAIL">
                                                    </div>
                                                </form>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                                <button type="button" class="btn btn-primary">Guardar cambios</button>
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
    </div>


    <!-- BOOTSTRAP -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <!-- TOASTIFY -->
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
    <!-- JS -->
    <script src="./js/main.js"></script>
</body>

</html>