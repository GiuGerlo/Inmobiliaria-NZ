<?php
$page_title = "Propiedades en Venta - Guatimozín y Zona";
$page_description = "Descubre nuestra amplia selección de propiedades en venta en Guatimozín y alrededores. Casas, terrenos, locales comerciales y más. Encuentra tu próxima propiedad con nosotros.";
$page_image = "assets/img/logo.png";

require_once 'config/config.php';
include_once 'includes/head.php';

// Obtener todas las categorías
$categorias = $db->query("SELECT * FROM tipos_propiedad ORDER BY nombre_categoria");

// Query base para propiedades
$base_query = "SELECT p.*, tp.nombre_categoria,
              (SELECT ruta_imagen FROM imagenes_propiedades WHERE id_propiedad = p.id ORDER BY orden ASC, id ASC LIMIT 1) as imagen_principal,
              (SELECT COUNT(*) FROM imagenes_propiedades WHERE id_propiedad = p.id) as total_imagenes
              FROM propiedades p 
              LEFT JOIN tipos_propiedad tp ON p.categoria = tp.id
              WHERE p.vendida = 0 ";

?>

<link rel="stylesheet" href="assets/css/propiedades.css">

<!-- Header de la página -->
<section class="page-header">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1 data-aos="fade-up">Nuestras Propiedades</h1>
                <p data-aos="fade-up" data-aos-delay="100">
                    Descubre la propiedad perfecta para ti. Ofrecemos una amplia variedad de opciones
                    para vos
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Filtros simples -->
<div class="filters-container">
    <div class="container">
        <div class="filters-wrapper justify-content-center">
            <button class="filter-btn active" data-filter="all">
                <i class="bi bi-grid"></i> Todas
            </button>
            <?php
            $categorias->data_seek(0);
            while ($cat = $categorias->fetch_assoc()):
            ?>
                <button class="filter-btn" data-filter="<?php echo $cat['id']; ?>" 
                        data-category-name="<?php echo htmlspecialchars($cat['nombre_categoria']); ?>">
                    <i class="bi bi-house"></i>
                    <?php echo htmlspecialchars($cat['nombre_categoria']); ?>
                </button>
            <?php endwhile; ?>
        </div>
    </div>
</div>

<!-- Buscador avanzado -->
<div class="advanced-search">
    <div class="container">
        <div class="search-input-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input type="text" class="search-input" placeholder="Buscar propiedades" id="propertySearch">
            <div class="search-results" id="searchResults"></div>
        </div>
    </div>
</div>

<!-- Contenedor de propiedades y mensaje sin resultados -->
<div class="container">
    <div class="no-results-message text-center" style="display: none;">
        <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Por el momento no hay <span class="category-name"></span> disponibles
        </div>
    </div>
    
    <!-- Contenedor de todas las categorías -->
    <div class="categories-container">
        <?php
        $categorias->data_seek(0);
        // Prepared statement reusable: el filtro por categoría va por bind, no por concatenación.
        $stmt_props = $db->prepare($base_query . " AND p.categoria = ? ORDER BY p.orden ASC, p.id DESC");
        while ($categoria = $categorias->fetch_assoc()):
            $stmt_props->bind_param('i', $categoria['id']);
            $stmt_props->execute();
            $propiedades = $stmt_props->get_result();
            if ($propiedades->num_rows > 0):
        ?>
            <div class="category-section" data-category="<?php echo $categoria['id']; ?>">
                <div class="category-header">
                    <h2 class="category-title"><?php echo htmlspecialchars($categoria['nombre_categoria']); ?></h2>
                </div>
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
                                        <?php if ($propiedad['tamanio']): ?>
                                            <div class="info-item">
                                                <i class="bi bi-rulers"></i>
                                                <span><?php echo htmlspecialchars($propiedad['tamanio']); ?></span>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                    <div class="property-footer">
                                        <a href="propiedad<?php echo $propiedad['id']; ?>" class="btn-view-property">
                                            Ver más <i class="bi bi-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endwhile; ?>
                </div>
            </div>
        <?php 
            endif;
        endwhile; 
        ?>
    </div>
</div>

<!-- CONTACTO -->

<?php include_once 'templates/contact-me.php'; ?>

<script src="assets/js/propiedades.js"></script>

<?php
include_once 'includes/footer.php';
?>