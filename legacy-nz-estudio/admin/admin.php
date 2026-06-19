<?php
require_once '../config/config.php';

// Estadísticas
$totalPropiedades = (int)$db->query("SELECT COUNT(*) AS t FROM propiedades WHERE vendida = 0")->fetch_assoc()['t'];
$totalVendidas    = (int)$db->query("SELECT COUNT(*) AS t FROM propiedades WHERE vendida = 1")->fetch_assoc()['t'];
$totalCategorias  = (int)$db->query("SELECT COUNT(*) AS t FROM tipos_propiedad")->fetch_assoc()['t'];
$totalImagenes    = (int)$db->query("SELECT COUNT(*) AS t FROM imagenes_propiedades")->fetch_assoc()['t'];

// Últimas propiedades agregadas (con imagen principal)
$ultimasPropiedades = $db->query(
    "SELECT p.id, p.titulo, p.localidad, tp.nombre_categoria,
            (SELECT ruta_imagen FROM imagenes_propiedades WHERE id_propiedad = p.id ORDER BY orden ASC, id ASC LIMIT 1) AS imagen
     FROM propiedades p
     LEFT JOIN tipos_propiedad tp ON p.categoria = tp.id
     WHERE p.vendida = 0
     ORDER BY p.id DESC
     LIMIT 5"
);

include_once 'includes/head.php';
?>

<div class="nz-page">

    <header class="nz-page-header">
        <div class="nz-page-title">
            <div class="nz-page-title-icon"><i class="fa-solid fa-gauge-high"></i></div>
            <div>
                <h1>Hola de nuevo</h1>
                <p>Resumen de tu inventario y accesos rápidos</p>
            </div>
        </div>
        <a href="propiedades.php" class="nz-btn-sm nz-btn-primary">
            <i class="fa-solid fa-plus"></i> Nueva propiedad
        </a>
    </header>

    <!-- Stats -->
    <section class="nz-stat-grid">
        <article class="nz-stat nz-stat--primary">
            <div class="nz-stat-icon"><i class="fa-solid fa-building"></i></div>
            <div class="nz-stat-body">
                <div class="nz-stat-value"><?php echo $totalPropiedades; ?></div>
                <div class="nz-stat-label">Propiedades activas</div>
            </div>
        </article>

        <article class="nz-stat nz-stat--success">
            <div class="nz-stat-icon"><i class="fa-solid fa-circle-check"></i></div>
            <div class="nz-stat-body">
                <div class="nz-stat-value"><?php echo $totalVendidas; ?></div>
                <div class="nz-stat-label">Vendidas</div>
            </div>
        </article>

        <article class="nz-stat nz-stat--accent">
            <div class="nz-stat-icon"><i class="fa-solid fa-tags"></i></div>
            <div class="nz-stat-body">
                <div class="nz-stat-value"><?php echo $totalCategorias; ?></div>
                <div class="nz-stat-label">Categorías</div>
            </div>
        </article>

        <article class="nz-stat nz-stat--info">
            <div class="nz-stat-icon"><i class="fa-solid fa-images"></i></div>
            <div class="nz-stat-body">
                <div class="nz-stat-value"><?php echo $totalImagenes; ?></div>
                <div class="nz-stat-label">Imágenes totales</div>
            </div>
        </article>
    </section>

    <!-- Acciones rápidas -->
    <h2 class="nz-section-title">Acciones rápidas</h2>
    <section class="nz-quick-grid">
        <a href="propiedades.php" class="nz-quick">
            <span class="nz-quick-icon"><i class="fa-solid fa-plus"></i></span>
            <div class="nz-quick-body">
                <p class="nz-quick-title">Nueva propiedad</p>
                <p class="nz-quick-sub">Agregar y subir imágenes</p>
            </div>
        </a>
        <a href="categorias.php" class="nz-quick">
            <span class="nz-quick-icon"><i class="fa-solid fa-folder-plus"></i></span>
            <div class="nz-quick-body">
                <p class="nz-quick-title">Gestionar categorías</p>
                <p class="nz-quick-sub">Tipos de propiedades</p>
            </div>
        </a>
        <a href="order-propiedades.php" class="nz-quick">
            <span class="nz-quick-icon"><i class="fa-solid fa-arrows-up-down"></i></span>
            <div class="nz-quick-body">
                <p class="nz-quick-title">Ordenar listado</p>
                <p class="nz-quick-sub">Drag-and-drop por categoría</p>
            </div>
        </a>
        <a href="vendidas.php" class="nz-quick">
            <span class="nz-quick-icon"><i class="fa-solid fa-circle-check"></i></span>
            <div class="nz-quick-body">
                <p class="nz-quick-title">Vendidas</p>
                <p class="nz-quick-sub">Ver propiedades cerradas</p>
            </div>
        </a>
    </section>

    <!-- Últimas propiedades -->
    <section class="nz-card">
        <div class="nz-card-header">
            <h5><i class="fa-solid fa-clock-rotate-left me-2 text-primary"></i>Últimas propiedades</h5>
            <a href="propiedades.php" class="nz-btn-sm nz-btn-ghost">
                Ver todas <i class="fa-solid fa-arrow-right"></i>
            </a>
        </div>

        <?php if ($ultimasPropiedades && $ultimasPropiedades->num_rows > 0): ?>
            <div class="nz-table-wrap">
                <table class="nz-table">
                    <thead>
                        <tr>
                            <th style="width: 60px;">#</th>
                            <th>Propiedad</th>
                            <th style="width: 180px;" class="nz-col-hide-sm">Localidad</th>
                            <th style="width: 80px; text-align: center;">Ver</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($p = $ultimasPropiedades->fetch_assoc()): ?>
                            <tr>
                                <td class="nz-id">#<?php echo (int)$p['id']; ?></td>
                                <td>
                                    <div class="nz-row-prop">
                                        <?php if (!empty($p['imagen'])): ?>
                                            <img src="../<?php echo htmlspecialchars($p['imagen'], ENT_QUOTES, 'UTF-8'); ?>"
                                                 alt="" class="nz-row-thumb">
                                        <?php else: ?>
                                            <div class="nz-row-thumb nz-row-thumb--empty">
                                                <i class="fa-solid fa-image"></i>
                                            </div>
                                        <?php endif; ?>
                                        <div class="nz-row-prop-text">
                                            <div class="nz-row-title"><?php echo htmlspecialchars($p['titulo']); ?></div>
                                            <div class="nz-row-sub">
                                                <?php if (!empty($p['nombre_categoria'])): ?>
                                                    <?php echo htmlspecialchars($p['nombre_categoria']); ?>
                                                <?php endif; ?>
                                                <span class="nz-row-loc-sm">· <?php echo htmlspecialchars($p['localidad']); ?></span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="nz-col-hide-sm"><?php echo htmlspecialchars($p['localidad']); ?></td>
                                <td style="text-align: center;">
                                    <a href="../propiedad<?php echo (int)$p['id']; ?>"
                                       class="nz-icon-btn"
                                       target="_blank" rel="noopener"
                                       title="Ver en el sitio">
                                        <i class="fa-solid fa-eye"></i>
                                    </a>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        <?php else: ?>
            <div class="nz-table-empty">
                <i class="fa-regular fa-folder-open fa-2x mb-2 d-block"></i>
                Todavía no hay propiedades cargadas.
            </div>
        <?php endif; ?>
    </section>

</div>

<style>
.nz-row-prop {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}
.nz-row-prop-text {
    min-width: 0;
}
.nz-row-thumb {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    background: var(--nz-surface-3);
}
.nz-row-thumb--empty {
    display: grid;
    place-items: center;
    color: var(--nz-text-muted);
    font-size: .9rem;
}
.nz-row-title {
    font-weight: 600;
    color: var(--nz-text);
    line-height: 1.3;
}
.nz-row-sub {
    font-size: var(--nz-fs-xs);
    color: var(--nz-text-muted);
    margin-top: 2px;
}

/* En desktop la localidad va en su columna; el sub-row solo muestra categoría */
.nz-row-loc-sm { display: none; }

@media (max-width: 768px) {
    /* Ocultar columna localidad y mostrarla inline en el sub-row */
    .nz-col-hide-sm { display: none; }
    .nz-row-loc-sm { display: inline; }

    /* Tabla menos ancha en mobile */
    .nz-table { min-width: 0; font-size: var(--nz-fs-sm); }
    .nz-table th, .nz-table td { padding: 10px 12px; }
    .nz-row-thumb { width: 36px; height: 36px; }
}
</style>

<?php include_once 'includes/footer.php'; ?>
