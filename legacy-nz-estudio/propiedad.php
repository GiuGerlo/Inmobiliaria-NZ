<?php
require_once 'config/config.php';

// Obtener el ID y datos de la propiedad primero
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    header('Location: propiedades.php');
    exit;
}

// Query para obtener los datos de la propiedad
$query = "SELECT p.*, tp.nombre_categoria 
          FROM propiedades p 
          LEFT JOIN tipos_propiedad tp ON p.categoria = tp.id 
          WHERE p.id = ?";

$stmt = $db->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header('Location: propiedades.php');
    exit;
}

$propiedad = $result->fetch_assoc();

// Obtener todas las imágenes de la propiedad
$images_query = "SELECT * FROM imagenes_propiedades WHERE id_propiedad = ? ORDER BY orden ASC, id ASC";
$images_stmt = $db->prepare($images_query);
$images_stmt->bind_param("i", $id);
$images_stmt->execute();
$images_result = $images_stmt->get_result();
$imagenes = $images_result->fetch_all(MYSQLI_ASSOC);

// Obtener propiedades relacionadas (misma categoría)
$related_query = "SELECT p.*, tp.nombre_categoria,
                  (SELECT ruta_imagen FROM imagenes_propiedades WHERE id_propiedad = p.id ORDER BY orden ASC, id ASC LIMIT 1) as imagen_principal
                  FROM propiedades p 
                  LEFT JOIN tipos_propiedad tp ON p.categoria = tp.id
                  WHERE p.categoria = ? AND p.id != ? AND p.vendida = 0 
                  ORDER BY RAND() LIMIT 3";
$related_stmt = $db->prepare($related_query);
$related_stmt->bind_param("ii", $propiedad['categoria'], $id);
$related_stmt->execute();
$related_result = $related_stmt->get_result();
$propiedades_relacionadas = $related_result->fetch_all(MYSQLI_ASSOC);

// Configurar SEO específico para esta propiedad
$page_title = $propiedad['titulo'];
$page_description = "Propiedad en " . $propiedad['localidad'] . ". " . 
                   ($propiedad['tamanio'] ? $propiedad['tamanio'] . ". " : "") . 
                   "Ubicada en " . $propiedad['ubicacion'];
$page_image = $propiedad['imagen_principal'] ?? "assets/img/logo.png";

include_once 'includes/head.php';
?>

<link rel="stylesheet" href="assets/css/propiedad.css">

<!-- Header de la propiedad -->
<section class="property-header">
    <div class="container">
        <div class="row">
            <div class="col-12">

                <h1 class="property-title">
                    <?php echo htmlspecialchars($propiedad['titulo']); ?>
                </h1>

                <div class="property-meta">
                    <?php if ($propiedad['localidad']): ?>
                        <div class="meta-item">
                            <i class="bi bi-geo-alt"></i>
                            <span><?php echo htmlspecialchars($propiedad['localidad']); ?></span>
                        </div>
                    <?php endif; ?>

                    <div class="meta-item">
                        <i class="bi bi-tag"></i>
                        <span><?php echo htmlspecialchars($propiedad['nombre_categoria']); ?></span>
                    </div>

                    <?php if (count($imagenes) > 0): ?>
                        <div class="meta-item">
                            <i class="bi bi-camera"></i>
                            <span><?php echo count($imagenes); ?> foto<?php echo count($imagenes) > 1 ? 's' : ''; ?></span>
                        </div>
                    <?php endif; ?>
                    <?php if ($propiedad['vendida']): ?>
                        <div class="status-badge vendida">VENDIDA</div>
                    <?php else: ?>
                        <div class="status-badge">DISPONIBLE</div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Contenido principal -->
<section class="property-detail-section">
    <div class="container">
        <div class="row">
            <!-- Columna principal -->
            <div class="col-lg-8">

                <!-- Galería de imágenes -->
                <?php if (count($imagenes) > 0): ?>
                    <div class="image-gallery">
                        <?php if (count($imagenes) > 1): ?>
                            <!-- Carrusel para múltiples imágenes -->
                            <div id="propertyCarousel" class="carousel slide main-carousel" data-bs-ride="carousel">
                                <div class="carousel-inner">
                                    <?php foreach ($imagenes as $index => $imagen): ?>
                                        <div class="carousel-item <?php echo $index === 0 ? 'active' : ''; ?>">
                                            <img src="<?php echo htmlspecialchars($imagen['ruta_imagen']); ?>"
                                                alt="<?php echo htmlspecialchars($propiedad['titulo']); ?> - Imagen <?php echo $index + 1; ?>"
                                                <?php echo $index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'; ?>
                                                decoding="async">
                                        </div>
                                    <?php endforeach; ?>
                                </div>

                                <!-- Controles -->
                                <button class="carousel-control-prev" type="button" data-bs-target="#propertyCarousel" data-bs-slide="prev">
                                    <i class="bi bi-chevron-left" aria-hidden="true"></i>
                                    <span class="visually-hidden">Anterior</span>
                                </button>
                                <button class="carousel-control-next" type="button" data-bs-target="#propertyCarousel" data-bs-slide="next">
                                    <i class="bi bi-chevron-right" aria-hidden="true"></i>
                                    <span class="visually-hidden">Siguiente</span>
                                </button>

                                <!-- Indicadores -->
                                <div class="carousel-indicators">
                                    <?php foreach ($imagenes as $index => $imagen): ?>
                                        <button type="button"
                                            data-bs-target="#propertyCarousel"
                                            data-bs-slide-to="<?php echo $index; ?>"
                                            <?php echo $index === 0 ? 'class="active" aria-current="true"' : ''; ?>
                                            aria-label="Slide <?php echo $index + 1; ?>"></button>
                                    <?php endforeach; ?>
                                </div>
                            </div>

                            <!-- Thumbnails -->
                            <div class="row thumbnails-row">
                                <?php foreach ($imagenes as $index => $imagen): ?>
                                    <div class="col-2">
                                        <div class="thumbnail-item <?php echo $index === 0 ? 'active' : ''; ?>"
                                            data-bs-target="#propertyCarousel"
                                            data-bs-slide-to="<?php echo $index; ?>">
                                            <img src="<?php echo htmlspecialchars($imagen['ruta_imagen']); ?>" alt="Thumbnail <?php echo $index + 1; ?>" loading="lazy" decoding="async">
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>

                        <?php else: ?>
                            <!-- Imagen única -->
                            <div class="main-carousel">
                                <img src="<?php echo htmlspecialchars($imagenes[0]['ruta_imagen']); ?>"
                                    alt="<?php echo htmlspecialchars($propiedad['titulo']); ?>"
                                    loading="eager" fetchpriority="high" decoding="async"
                                    style="width: 100%; height: 500px; object-fit: contain; background: #fff;">
                            </div>
                        <?php endif; ?>
                    </div>
                <?php else: ?>
                    <!-- No hay imágenes -->
                    <div class="image-gallery">
                        <div class="main-carousel">
                            <img src="assets/img/no-image.jpg"
                                alt="Sin imagen disponible"
                                loading="eager" decoding="async"
                                style="width: 100%; height: 500px; object-fit: contain; background: #fff;">
                        </div>
                    </div>
                <?php endif; ?>

                <!-- Información de la propiedad -->
                <div class="property-info-card">

                    <!-- Información básica -->
                    <div class="info-section">
                        <h3 class="section-title">
                            <i class="bi bi-info-circle me-2"></i>
                            Información General
                        </h3>

                        <div class="info-grid">
                            <?php if ($propiedad['ubicacion']): ?>
                                <div class="info-item">
                                    <i class="bi bi-map"></i>
                                    <div class="info-content">
                                        <h6>Ubicación</h6>
                                        <p><?php echo htmlspecialchars($propiedad['ubicacion']); ?></p>
                                    </div>
                                </div>
                            <?php endif; ?>

                            <?php if ($propiedad['tamanio']): ?>
                                <div class="info-item">
                                    <i class="bi bi-rulers"></i>
                                    <div class="info-content">
                                        <h6>Dimensiones</h6>
                                        <p><?php echo htmlspecialchars($propiedad['tamanio']); ?></p>
                                    </div>
                                </div>
                            <?php endif; ?>

                            <div class="info-item">
                                <i class="bi bi-tag"></i>
                                <div class="info-content">
                                    <h6>Categoría</h6>
                                    <p><?php echo htmlspecialchars($propiedad['nombre_categoria']); ?></p>
                                </div>
                            </div>

                            <div class="info-item">
                                <i class="bi bi-check-circle"></i>
                                <div class="info-content">
                                    <h6>Estado</h6>
                                    <p><?php echo $propiedad['vendida'] ? 'Vendida' : 'Disponible'; ?></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Servicios -->
                    <?php if ($propiedad['servicios']): ?>
                        <div class="info-section">
                            <h3 class="section-title">
                                <i class="bi bi-gear me-2"></i>
                                Servicios
                            </h3>

                            <div class="services-list">
                                <?php
                                $servicios = explode(',', $propiedad['servicios']);
                                foreach ($servicios as $servicio):
                                    $servicio = trim($servicio);
                                    if (!empty($servicio)):
                                ?>
                                        <span class="service-tag"><?php echo htmlspecialchars($servicio); ?></span>
                                <?php
                                    endif;
                                endforeach;
                                ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Características -->
                    <?php if ($propiedad['caracteristicas']): ?>
                        <div class="info-section">
                            <h3 class="section-title">
                                <i class="bi bi-list-check me-2"></i>
                                Características
                            </h3>

                            <div class="features-list">
                                <?php
                                $caracteristicas = explode(',', $propiedad['caracteristicas']);
                                foreach ($caracteristicas as $caracteristica):
                                    $caracteristica = trim($caracteristica);
                                    if (!empty($caracteristica)):
                                ?>
                                        <div class="feature-item">
                                            <i class="bi bi-check2"></i>
                                            <span><?php echo htmlspecialchars($caracteristica); ?></span>
                                        </div>
                                <?php
                                    endif;
                                endforeach;
                                ?>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Mapa -->
                <?php if ($propiedad['mapa']): ?>
                    <div class="map-container">
                        <h3 class="section-title mb-3">
                            <i class="bi bi-geo-alt me-2"></i>
                            Ubicación
                        </h3>
                        <div class="responsive-map">
                            <?php
                            // El campo `mapa` es HTML crudo (iframe de Google Maps) cargado por admin.
                            // TODO: validar que el iframe sea de google.com/maps y limpiar atributos
                            // peligrosos en la próxima fase. Hoy: admin único y trusted.
                            $mapa_limpio = str_replace('\&quot;', '"', $propiedad['mapa']);
                            echo html_entity_decode(stripslashes($mapa_limpio));
                            ?>
                        </div>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
                <div class="property-info-card">
                    <h3 class="section-title">
                        <i class="bi bi-chat-dots me-2"></i>
                        Contactar
                    </h3>

                    <p class="mb-4">
                        ¿Te interesa esta propiedad? Contáctanos para más información,
                        visitas programadas o para hacer una consulta.
                    </p>

                    <div class="action-buttons">
                        <a href="https://wa.me/5493468525227?text=Hola, me interesa la propiedad: <?php echo urlencode($propiedad['titulo']); ?>"
                            class="btn-contact btn-whatsapp" target="_blank">
                            <i class="bi bi-whatsapp"></i>
                            WhatsApp
                        </a>

                        <a href="inicio#contacto" class="btn-contact">
                            <i class="bi bi-envelope"></i>
                            Contactar
                        </a>

                        <button class="btn-contact btn-share" onclick="shareProperty()">
                            <i class="bi bi-share"></i>
                            Compartir
                        </button>
                    </div>

                    <hr class="my-4">

                    <div class="contact-info">
                        <h5 class="mb-3">Información de contacto</h5>
                        <div class="info-item mb-3">
                            <i class="bi bi-telephone"></i>
                            <div class="info-content">
                                <h6>Teléfono</h6>
                                <p>3468 52-5227</p>
                            </div>
                        </div>

                        <div class="info-item mb-3">
                            <i class="bi bi-envelope"></i>
                            <div class="info-content">
                                <h6>Email</h6>
                                <p>nadinazaranich@gmail.com</p>
                            </div>
                        </div>

                        <div class="info-item">
                            <i class="bi bi-geo-alt"></i>
                            <div class="info-content">
                                <h6>Oficina</h6>
                                <p>Catamarca 227, Guatimozín, Córdoba</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Propiedades relacionadas -->
        <?php if (count($propiedades_relacionadas) > 0): ?>
            <div class="related-properties">
                <h3 class="section-title text-center mb-5">
                    <i class="bi bi-house-heart me-2"></i>
                    Propiedades Similares
                </h3>

                <div class="row">
                    <?php foreach ($propiedades_relacionadas as $related): ?>
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="related-card">
                                <div class="related-image">
                                    <?php if ($related['imagen_principal']): ?>
                                        <img src="<?php echo htmlspecialchars($related['imagen_principal']); ?>" alt="<?php echo htmlspecialchars($related['titulo']); ?>" loading="lazy" decoding="async">
                                    <?php else: ?>
                                        <img src="assets/img/no-image.jpg" alt="Sin imagen" loading="lazy" decoding="async">
                                    <?php endif; ?>
                                </div>

                                <div class="related-content">
                                    <h4 class="related-title"><?php echo htmlspecialchars($related['titulo']); ?></h4>

                                    <?php if ($related['localidad']): ?>
                                        <div class="related-location">
                                            <i class="bi bi-geo-alt"></i>
                                            <span><?php echo htmlspecialchars($related['localidad']); ?></span>
                                        </div>
                                    <?php endif; ?>

                                    <a href="propiedad<?php echo $related['id']; ?>" class="btn-contact">
                                        Ver detalles <i class="bi bi-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</section>

<script src="assets/js/propiedad.js"></script>

<?php
include_once 'includes/footer.php';
?>