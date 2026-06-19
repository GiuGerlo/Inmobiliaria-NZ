<?php include_once 'includes/head.php'; ?>
<link rel="stylesheet" href="assets/css/propiedades.css">
<style>
    .error-404-container {
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .error-404-title {
        font-size: 6rem;
        font-weight: 900;
        color: var(--accent-color, #007bff);
        margin-bottom: 10px;
        line-height: 1;
    }

    .error-404-msg {
        font-size: 1.5rem;
        color: #444;
        margin-bottom: 30px;
    }

    .error-404-btn {
        background: var(--accent-color, #007bff);
        color: #fff;
        border: none;
        padding: 14px 36px;
        border-radius: 30px;
        font-size: 1.1rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s;
        display: inline-block;
    }

    .error-404-btn:hover {
        background: #0056b3;
        color: #fff;
        text-decoration: none;
    }
</style>
<div class="error-404-container">
    <div class="error-404-title">404</div>
    <div class="error-404-msg">
        ¡Ups! La página que buscas no existe.<br>
        Es posible que haya sido eliminada o que la dirección sea incorrecta.
    </div>
    <a href="inicio" class="error-404-btn"><i class="bi bi-arrow-left"></i> Volver al inicio</a>
</div>
<?php include_once 'includes/footer.php'; ?>