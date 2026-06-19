<!DOCTYPE html>
<html lang="es">

<head>
    <?php include_once 'head-meta.php'; ?>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>Estudio Jurídico-Inmobiliario Nadina Zaranich</title>
    <meta name="description" content="">
    <meta name="keywords" content="">

    <!-- Favicons -->
    <link href="assets/img/logo.ico" rel="icon">
    <link href="assets/img/logo.png" rel="apple-touch-icon">

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com" rel="preconnect">
    <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

    <!-- Vendor CSS Files -->
    <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
    <link href="assets/vendor/aos/aos.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css" rel="stylesheet">

    <!-- Main CSS File -->
    <link href="assets/css/main.css" rel="stylesheet">

</head>

<body class="index-page">

    <header id="header" class="header d-flex align-items-center sticky-top">
        <div class="container-fluid container-xl position-relative d-flex align-items-center justify-content-between">

            <a href="index.php" class="logo d-flex align-items-center">
                <!-- Uncomment the line below if you also wish to use an image logo -->
                <img src="assets/img/logo.png" alt="Logo Nadina Zaranich">
                <!-- <h1 class="sitename">logo</h1> -->
            </a>

            <nav id="navmenu" class="navmenu">
                <ul>
                    <li><a href="inicio" class="active" style="text-decoration: none;">Inicio</a></li>
                    <li><a href="inicio#capua" style="text-decoration: none;">Capua</a></li>
                    <li><a href="#" id="alquiler-link" style="text-decoration: none;">Alquiler</a></li>
                    <li class="dropdown"><a href="#" style="text-decoration: none;"><span>Venta</span> <i class="bi bi-chevron-down toggle-dropdown"></i></a>
                        <ul>
                            <li><a href="propiedades.php">Todas</a></li>
                            <li><a href="propiedades.php#cat-1">Casas</a></li>
                            <li><a href="propiedades.php#cat-5">Cocheras</a></li>
                            <li><a href="propiedades.php#cat-6">Departamentos</a></li>
                            <li><a href="propiedades.php#cat-3">Locales</a></li>
                            <li><a href="propiedades.php#cat-4">Quintas</a></li>
                            <li><a href="propiedades.php#cat-2">Terrenos</a></li>
                        </ul>
                    </li>
                    <li><a href="vendidas" style="text-decoration: none;">Vendida</a></li>
                    <li><a href="inicio#contacto" style="text-decoration: none;">Contacto</a></li>
                </ul>
                <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
            </nav>

        </div>
    </header>

    <main class="main">

        <!-- SweetAlert2 -->
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            var alquilerLink = document.getElementById('alquiler-link');
            if (alquilerLink) {
                alquilerLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    Swal.fire({
                        icon: 'info',
                        title: '¡Próximamente!',
                        text: 'Todavía no están disponibles los alquileres.',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'Entendido'
                    });
                });
            }
        });
        </script>