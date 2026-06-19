<?php
$page_title = "Propiedades Vendidas - Historial de Ventas";
$page_description = "Explora nuestro historial de propiedades vendidas en Guatimozín y alrededores. Referencias de nuestro trabajo y trayectoria en el mercado inmobiliario.";
$page_image = "assets/img/logo.png";

require_once 'config/config.php';
include_once 'includes/head.php';

// Query para propiedades vendidas
$query = "SELECT p.*, tp.nombre_categoria,
          (SELECT ruta_imagen FROM imagenes_propiedades WHERE id_propiedad = p.id ORDER BY orden ASC, id ASC LIMIT 1) as imagen_principal
          FROM propiedades p 
          LEFT JOIN tipos_propiedad tp ON p.categoria = tp.id
          WHERE p.vendida = 1 
          ORDER BY p.orden ASC, p.id DESC";

$propiedades = $db->query($query);
?>

<link rel="stylesheet" href="assets/css/propiedades.css">

<!-- Header de la página -->
<section class="page-header">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1 data-aos="fade-up">Propiedades Vendidas</h1>
                <p data-aos="fade-up" data-aos-delay="100">
                    Historial de propiedades que hemos vendido exitosamente
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Contenedor de propiedades -->
<section class="properties-section">
    <div class="container">
        <?php if ($propiedades->num_rows > 0): ?>
            <div class="properties-grid">
                <?php while ($propiedad = $propiedades->fetch_assoc()): ?>
                    <div class="property-item">
                        <div class="property-card">
                            <div class="property-image">
                                <?php if ($propiedad['imagen_principal']): ?>
                                    <img src="<?php echo htmlspecialchars($propiedad['imagen_principal'], ENT_QUOTES, 'UTF-8'); ?>"
                                         alt="<?php echo htmlspecialchars($propiedad['titulo']); ?>"
                                         loading="lazy" decoding="async">
                                <?php else: ?>
                                    <img src="assets/img/no-image.jpg" alt="Sin imagen" loading="lazy" decoding="async">
                                <?php endif; ?>
                                <div class="property-status vendida">VENDIDA</div>
                            </div>
                            <div class="property-content">
                                <h3 class="property-title"><?php echo htmlspecialchars($propiedad['titulo']); ?></h3>
                                <div class="property-info">
                                    <?php if ($propiedad['localidad']): ?>
                                        <div class="info-item">
                                            <i class="bi bi-geo-alt"></i>
                                            <span><?php echo htmlspecialchars($propiedad['localidad']); ?></span>
                                        </div>
                                    <?php endif; ?>
                                    <?php if ($propiedad['ubicacion']): ?>
                                        <div class="info-item">
                                            <i class="bi bi-map"></i>
                                            <span><?php echo htmlspecialchars($propiedad['ubicacion']); ?></span>
                                        </div>
                                    <?php endif; ?>
                                    <div class="info-item">
                                        <i class="bi bi-tag"></i>
                                        <span><?php echo htmlspecialchars($propiedad['nombre_categoria']); ?></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
            </div>
        <?php else: ?>
            <div class="alert alert-info text-center my-5">
                <i class="bi bi-info-circle me-2"></i>
                No hay propiedades vendidas para mostrar en este momento.
            </div>
        <?php endif; ?>
    </div>
</section>

<?php include_once 'includes/footer.php'; ?>
