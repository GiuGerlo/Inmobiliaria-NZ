<?php
require_once '../config/config.php';
$includeDataTablesStyles = true;
require_once 'includes/head.php';

// Propiedades activas con imagen principal (UNA sola query reutilizable)
$rows = $db->query(
    "SELECT p.*, tp.nombre_categoria,
            (SELECT ruta_imagen FROM imagenes_propiedades WHERE id_propiedad = p.id ORDER BY orden ASC, id ASC LIMIT 1) AS imagen_principal
     FROM propiedades p
     LEFT JOIN tipos_propiedad tp ON p.categoria = tp.id
     WHERE vendida = 0
     ORDER BY p.id DESC"
)->fetch_all(MYSQLI_ASSOC);

// Sets para opciones iniciales de los dropdowns (orden alfa)
$cats_unicas = array_values(array_unique(array_filter(array_column($rows, 'nombre_categoria'))));
$locs_unicas = array_values(array_unique(array_filter(array_column($rows, 'localidad'))));
sort($cats_unicas, SORT_STRING | SORT_FLAG_CASE);
sort($locs_unicas, SORT_STRING | SORT_FLAG_CASE);
?>

<div class="nz-page">

    <header class="nz-page-header">
        <div class="nz-page-title">
            <div class="nz-page-title-icon"><i class="fa-solid fa-building"></i></div>
            <div>
                <h1>Propiedades</h1>
                <p>Gestioná el catálogo activo de propiedades</p>
            </div>
        </div>
        <div class="nz-page-actions">
            <a href="order-propiedades.php" class="nz-btn-sm nz-btn-ghost">
                <i class="fa-solid fa-arrows-up-down"></i> Ordenar
            </a>
            <button type="button" class="nz-btn-sm nz-btn-primary" data-bs-toggle="modal" data-bs-target="#modalPropiedad">
                <i class="fa-solid fa-plus"></i> Nueva propiedad
            </button>
        </div>
    </header>

    <section class="nz-card">
        <div class="nz-card-body" style="padding: var(--nz-sp-4);">

            <!-- Toolbar: búsqueda libre + filtros cross-linked + CSV -->
            <div class="nz-toolbar">
                <div class="nz-toolbar-search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="search" id="busquedaGlobal" class="nz-input"
                           placeholder="Buscar en título, ubicación, servicios, características..."
                           autocomplete="off">
                </div>
                <div class="nz-toolbar-filters">
                    <select id="filtroCategoria" class="nz-select nz-toolbar-select" aria-label="Filtrar por categoría">
                        <option value="">Todas las categorías</option>
                        <?php foreach ($cats_unicas as $cat): ?>
                            <option value="<?php echo htmlspecialchars($cat); ?>"><?php echo htmlspecialchars($cat); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <select id="filtroLocalidad" class="nz-select nz-toolbar-select" aria-label="Filtrar por localidad">
                        <option value="">Todas las localidades</option>
                        <?php foreach ($locs_unicas as $loc): ?>
                            <option value="<?php echo htmlspecialchars($loc); ?>"><?php echo htmlspecialchars($loc); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <button type="button" id="btnLimpiarFiltros" class="nz-btn-sm nz-btn-ghost" title="Limpiar filtros">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <button type="button" id="btnExportCsv" class="nz-btn-sm nz-btn-ghost" title="Exportar CSV">
                        <i class="fa-solid fa-file-csv"></i> CSV
                    </button>
                </div>
            </div>
            <div id="filtroInfo" class="nz-filter-info" hidden></div>

            <!-- Tabla -->
            <div class="nz-table-wrap">
                <table id="tablaPropiedades" class="table align-middle" style="width:100%">
                    <thead>
                        <tr>
                            <th style="width: 70px;">#</th>
                            <th style="width: 90px;">Imagen</th>
                            <th>Título</th>
                            <th style="width: 160px;">Categoría</th>
                            <th style="width: 160px;">Localidad</th>
                            <th style="width: 130px; text-align: center;">Acciones</th>
                            <th>__search</th><!-- hidden: blob full-text -->
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($rows as $p):
                            // Blob full-text para la columna hidden buscable
                            $blob = trim(implode(' ', array_filter([
                                $p['titulo']          ?? '',
                                $p['localidad']       ?? '',
                                $p['ubicacion']       ?? '',
                                $p['tamanio']         ?? '',
                                $p['servicios']       ?? '',
                                $p['caracteristicas'] ?? '',
                                $p['nombre_categoria']?? '',
                            ])));
                            $id  = (int)$p['id'];
                            $cat = $p['nombre_categoria'] ?? '';
                            $loc = $p['localidad'] ?? '';
                        ?>
                            <tr data-cat="<?php echo htmlspecialchars($cat, ENT_QUOTES); ?>"
                                data-loc="<?php echo htmlspecialchars($loc, ENT_QUOTES); ?>">
                                <td class="nz-id" data-order="<?php echo $id; ?>">#<?php echo $id; ?></td>
                                <td>
                                    <?php if ($p['imagen_principal']): ?>
                                        <img src="../<?php echo htmlspecialchars($p['imagen_principal'], ENT_QUOTES, 'UTF-8'); ?>"
                                             alt=""
                                             loading="lazy"
                                             class="nz-row-thumb">
                                    <?php else: ?>
                                        <div class="nz-row-thumb nz-row-thumb--empty">
                                            <i class="fa-solid fa-image"></i>
                                        </div>
                                    <?php endif; ?>
                                </td>
                                <td class="nz-row-title"><?php echo htmlspecialchars($p['titulo']); ?></td>
                                <td><span class="nz-cat-pill"><?php echo htmlspecialchars($cat ?: '—'); ?></span></td>
                                <td><?php echo htmlspecialchars($loc); ?></td>
                                <td>
                                    <div class="nz-table-actions" style="justify-content:center;width:100%;">
                                        <button type="button" class="nz-icon-btn"
                                                onclick="editarPropiedad(<?php echo $id; ?>)"
                                                title="Editar">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>
                                        <button type="button" class="nz-icon-btn nz-icon-btn--success"
                                                onclick="marcarVendida(<?php echo $id; ?>)"
                                                title="Marcar como vendida">
                                            <i class="fa-solid fa-check"></i>
                                        </button>
                                        <button type="button" class="nz-icon-btn nz-icon-btn--danger"
                                                onclick="confirmarEliminacion(<?php echo $id; ?>)"
                                                title="Eliminar">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                                <td><?php echo htmlspecialchars($blob, ENT_QUOTES, 'UTF-8'); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</div>

<?php
require_once 'templates/modal_propiedad.php';

// Script específico de la página (se carga después de jQuery + DataTables en footer)
$pageScript = 'assets/js/pages/propiedades.js';
require_once 'includes/footer.php';
?>
