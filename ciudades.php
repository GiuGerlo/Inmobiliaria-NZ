<!DOCTYPE html>
<html lang="eS">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="./assets/logo.ico" type="image/x-icon">
    <title>Ciudades - NZ</title>
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FONT-AWESOME -->
    <script src="https://kit.fontawesome.com/4f18558b97.js" crossorigin="anonymous"></script>
    <!-- LINEICONS -->
    <link href="https://cdn.lineicons.com/5.0/lineicons.css" rel="stylesheet" />
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
                    <a href="./duenos.php" class="sidebar-link">
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
                    <a href="#" class="sidebar-link">
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
            <div class="text-center h1 mt-4 mb-4 fw-bold">
                <h1>Ciudades</h1>
            </div>
        </div>
    </div>




    <!-- BOOTSTRAP -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <script src="./js/main.js"></script>
</body>
</html>