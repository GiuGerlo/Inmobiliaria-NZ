<?php
// Guard de admin: verifica sesión + timeout idle (1h por defecto).
nz_require_admin();

$current_page = basename($_SERVER['PHP_SELF']);
$user_email   = $_SESSION['user_email'] ?? '';
$user_letter  = strtoupper(substr($user_email, 0, 1) ?: 'A');

// Items del sidebar (orden importa). Cada uno: file, label, icon.
$nav_items = [
    ['file' => 'admin.php',            'label' => 'Dashboard',   'icon' => 'fa-solid fa-gauge-high'],
    ['file' => 'propiedades.php',      'label' => 'Propiedades', 'icon' => 'fa-solid fa-building'],
    ['file' => 'vendidas.php',         'label' => 'Vendidas',    'icon' => 'fa-solid fa-circle-check'],
    ['file' => 'order-propiedades.php','label' => 'Orden',       'icon' => 'fa-solid fa-arrows-up-down'],
    ['file' => 'categorias.php',       'label' => 'Categorías',  'icon' => 'fa-solid fa-tags'],
];

$nav_items_account = [
    ['file' => 'perfil.php',           'label' => 'Perfil',      'icon' => 'fa-solid fa-user-shield'],
];

// Título de página por archivo
$page_titles = [
    'admin.php'            => 'Dashboard',
    'propiedades.php'      => 'Propiedades',
    'vendidas.php'         => 'Propiedades vendidas',
    'categorias.php'       => 'Categorías',
    'order-propiedades.php'=> 'Ordenar propiedades',
    'perfil.php'           => 'Mi perfil',
];
$page_title = $page_titles[$current_page] ?? 'Panel';

// Estado del sidebar persistido en cookie (server-side para evitar FOUC).
// Sólo aplica el modo mini en desktop; mobile siempre arranca con off-canvas cerrado.
$sidebar_mini = (($_COOKIE['nz_sidebar_mini'] ?? '0') === '1') ? ' nz-sidebar-mini' : '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo htmlspecialchars(nz_csrf_token(), ENT_QUOTES, 'UTF-8'); ?>">
    <title><?php echo htmlspecialchars($page_title); ?> · NZ Estudio</title>

    <link href="../assets/img/logo.ico" rel="icon">
    <link href="../assets/img/logo.png" rel="apple-touch-icon">

    <!-- Bootstrap (estructura mínima) + Font Awesome + fuente -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Admin CSS (tokens + componentes nuevos + aliases compat) -->
    <link rel="stylesheet" href="assets/css/main.css">

    <?php if (isset($includeDataTablesStyles) && $includeDataTablesStyles): ?>
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css">
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/responsive/2.5.0/css/responsive.bootstrap5.min.css">
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.bootstrap5.min.css">
    <?php endif; ?>

    <!-- jQuery (DataTables + AJAX legacy) -->
    <script src="https://code.jquery.com/jquery-3.7.0.js"></script>

    <!-- CSRF: inyecta X-CSRF-Token en todos los AJAX/fetch -->
    <script src="assets/js/core/csrf.js"></script>
</head>
<body class="nz-admin<?php echo $sidebar_mini; ?>">

    <!-- Backdrop mobile -->
    <div class="nz-sidebar-backdrop" aria-hidden="true"></div>

    <!-- Sidebar -->
    <aside class="nz-sidebar" aria-label="Navegación principal">
        <a href="admin.php" class="nz-sidebar-brand">
            <img src="../assets/img/logo.png" alt="NZ Estudio">
            <span class="nz-sidebar-brand-text">
                <span class="nz-brand-name">NZ Estudio</span>
                <span class="nz-brand-sub">Panel admin</span>
            </span>
        </a>

        <nav>
            <ul class="nz-sidebar-nav">
                <li class="nz-sidebar-section">Gestión</li>
                <?php foreach ($nav_items as $item): ?>
                    <li class="nz-sidebar-item" data-label="<?php echo htmlspecialchars($item['label']); ?>">
                        <a class="nz-sidebar-link <?php echo ($current_page === $item['file']) ? 'is-active' : ''; ?>"
                           href="<?php echo htmlspecialchars($item['file']); ?>">
                            <i class="<?php echo htmlspecialchars($item['icon']); ?>" aria-hidden="true"></i>
                            <span><?php echo htmlspecialchars($item['label']); ?></span>
                        </a>
                    </li>
                <?php endforeach; ?>

                <li class="nz-sidebar-section">Cuenta</li>
                <?php foreach ($nav_items_account as $item): ?>
                    <li class="nz-sidebar-item" data-label="<?php echo htmlspecialchars($item['label']); ?>">
                        <a class="nz-sidebar-link <?php echo ($current_page === $item['file']) ? 'is-active' : ''; ?>"
                           href="<?php echo htmlspecialchars($item['file']); ?>">
                            <i class="<?php echo htmlspecialchars($item['icon']); ?>" aria-hidden="true"></i>
                            <span><?php echo htmlspecialchars($item['label']); ?></span>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </nav>
    </aside>

    <!-- Main: navbar + contenido -->
    <div class="nz-main">
        <nav class="nz-navbar">
            <button type="button"
                    class="nz-navbar-toggle"
                    data-nz-sidebar-toggle
                    aria-label="Alternar menú lateral">
                <i class="fa-solid fa-bars" aria-hidden="true"></i>
            </button>

            <h1 class="nz-navbar-title"><?php echo htmlspecialchars($page_title); ?></h1>

            <div class="nz-navbar-user">
                <a href="perfil.php" class="nz-user-chip" title="Ir al perfil">
                    <span class="nz-user-avatar"><?php echo htmlspecialchars($user_letter); ?></span>
                    <span class="nz-user-chip-name"><?php echo htmlspecialchars($user_email); ?></span>
                </a>
                <a href="../logout.php" class="nz-navbar-logout" title="Cerrar sesión" aria-label="Cerrar sesión">
                    <i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
                </a>
            </div>
        </nav>
