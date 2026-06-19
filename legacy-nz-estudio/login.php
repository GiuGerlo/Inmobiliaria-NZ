<?php
require_once 'config/config.php';

if (isset($_SESSION['user_id'])) {
    header('Location: admin/admin.php');
    exit;
}

$expired = isset($_GET['expired']);
$logged_out = isset($_GET['logout']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión — NZ Estudio</title>
    <link href="assets/img/logo.ico" rel="icon">
    <link href="assets/img/logo.png" rel="apple-touch-icon">

    <!-- Bootstrap Icons + fuente -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Paleta + estilos del login -->
    <link rel="stylesheet" href="assets/css/login.css">
</head>
<body class="nz-auth">

    <main class="nz-auth-card" role="main">
        <header class="nz-auth-header">
            <div class="nz-auth-logo">
                <img src="assets/img/logo.png" alt="NZ Estudio">
            </div>
            <h1 class="nz-auth-title">Bienvenido de nuevo</h1>
            <p class="nz-auth-subtitle">Iniciá sesión para acceder al panel</p>
        </header>

        <?php if ($logged_out): ?>
            <div class="nz-alert nz-alert-success" role="status">
                <i class="bi bi-check-circle me-1"></i> Cerraste sesión correctamente.
            </div>
        <?php endif; ?>

        <?php if ($expired): ?>
            <div class="nz-alert nz-alert-warning" role="status">
                <i class="bi bi-clock-history me-1"></i> Tu sesión expiró por inactividad. Volvé a entrar.
            </div>
        <?php endif; ?>

        <form id="loginForm" action="auth.php" method="POST" novalidate>
            <?php echo nz_csrf_field(); ?>

            <div class="nz-field">
                <label for="email">Correo electrónico</label>
                <div class="nz-input-wrap">
                    <span class="nz-input-icon"><i class="bi bi-envelope"></i></span>
                    <input type="email"
                           id="email"
                           name="email"
                           placeholder="tu@email.com"
                           autocomplete="username"
                           required>
                </div>
            </div>

            <div class="nz-field">
                <label for="password">Contraseña</label>
                <div class="nz-input-wrap">
                    <span class="nz-input-icon"><i class="bi bi-lock"></i></span>
                    <input type="password"
                           id="password"
                           name="password"
                           placeholder="••••••••"
                           autocomplete="current-password"
                           minlength="6"
                           required>
                    <button type="button"
                            class="nz-toggle"
                            data-target="#password"
                            aria-label="Mostrar u ocultar contraseña">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="nz-btn nz-btn-primary">
                <i class="bi bi-box-arrow-in-right"></i> Iniciar sesión
            </button>
        </form>

        <p class="nz-auth-foot">
            ¿Olvidaste la contraseña? Contactá al administrador del sitio.
        </p>
    </main>

    <footer class="nz-auth-credit">
        Desarrollado por
        <a href="https://giulianogerlo.vercel.app/" target="_blank" rel="noopener" aria-label="Giuliano Gerlo">
            <img src="assets/img/logo-secundario.svg" alt="Giuliano Gerlo" class="nz-auth-credit-logo">
        </a>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="assets/js/login.js"></script>
</body>
</html>
