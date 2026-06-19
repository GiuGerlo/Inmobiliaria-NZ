<?php
require_once '../config/config.php';
$includeDataTablesStyles = true;
require_once 'includes/head.php';

$resultado = $db->query(
    "SELECT p.*, tp.nombre_categoria,
            (SELECT ruta_imagen FROM imagenes_propiedades WHERE id_propiedad = p.id ORDER BY orden ASC, id ASC LIMIT 1) AS imagen_principal
     FROM propiedades p
     LEFT JOIN tipos_propiedad tp ON p.categoria = tp.id
     WHERE vendida = 1
     ORDER BY p.id DESC"
);
?>

<div class="nz-page">

    <header class="nz-page-header">
        <div class="nz-page-title">
            <div class="nz-page-title-icon"><i class="fa-solid fa-circle-check"></i></div>
            <div>
                <h1>Propiedades vendidas</h1>
                <p>Archivo de propiedades marcadas como vendidas</p>
            </div>
        </div>
    </header>

    <section class="nz-card">
        <div class="nz-card-body" style="padding: var(--nz-sp-4);">
            <div class="nz-table-wrap">
                <table id="tablaVendidas" class="table align-middle" style="width:100%">
                    <thead>
                        <tr>
                            <th style="width: 70px;">#</th>
                            <th style="width: 90px;">Imagen</th>
                            <th>Título</th>
                            <th style="width: 160px;">Categoría</th>
                            <th style="width: 160px;">Localidad</th>
                            <th style="width: 120px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($propiedad = $resultado->fetch_assoc()): ?>
                            <tr>
                                <td class="nz-id" data-order="<?php echo (int)$propiedad['id']; ?>">#<?php echo (int)$propiedad['id']; ?></td>
                                <td>
                                    <?php if ($propiedad['imagen_principal']): ?>
                                        <img src="../<?php echo htmlspecialchars($propiedad['imagen_principal'], ENT_QUOTES, 'UTF-8'); ?>"
                                             alt=""
                                             style="width:52px;height:52px;border-radius:8px;object-fit:cover;border:1px solid var(--nz-border);">
                                    <?php else: ?>
                                        <div style="width:52px;height:52px;border-radius:8px;background:var(--nz-surface-3);display:grid;place-items:center;color:var(--nz-text-muted);">
                                            <i class="fa-solid fa-image"></i>
                                        </div>
                                    <?php endif; ?>
                                </td>
                                <td style="font-weight: 600;"><?php echo htmlspecialchars($propiedad['titulo']); ?></td>
                                <td>
                                    <span class="nz-cat-pill">
                                        <?php echo htmlspecialchars($propiedad['nombre_categoria'] ?? '—'); ?>
                                    </span>
                                </td>
                                <td><?php echo htmlspecialchars($propiedad['localidad']); ?></td>
                                <td>
                                    <div class="nz-table-actions" style="justify-content:center;width:100%;">
                                        <button type="button" class="nz-icon-btn"
                                                onclick="verPropiedad(<?php echo (int)$propiedad['id']; ?>)"
                                                title="Ver detalle">
                                            <i class="fa-solid fa-eye"></i>
                                        </button>
                                        <button type="button" class="nz-icon-btn nz-icon-btn--danger"
                                                onclick="confirmarEliminacionVendida(<?php echo (int)$propiedad['id']; ?>)"
                                                title="Eliminar">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</div>

<!-- Modal detalle de propiedad vendida -->
<div class="modal fade" id="modalVerPropiedad" tabindex="-1" aria-labelledby="modalVerPropiedadLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalVerPropiedadLabel">
                    <i class="fa-solid fa-eye"></i> Detalle de propiedad
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div id="detallePropiedad"></div>
            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function () {
    $('#tablaVendidas').DataTable({
        responsive: true,
        language: {
            emptyTable: 'No hay propiedades vendidas',
            info: 'Mostrando _START_ a _END_ de _TOTAL_ propiedades',
            infoEmpty: 'Mostrando 0 propiedades',
            infoFiltered: '(filtrado de _MAX_ totales)',
            lengthMenu: 'Mostrar _MENU_',
            search: '',
            searchPlaceholder: 'Buscar...',
            zeroRecords: 'Sin resultados',
            paginate: {
                first:    '<i class="fa-solid fa-angles-left"></i>',
                previous: '<i class="fa-solid fa-chevron-left"></i>',
                next:     '<i class="fa-solid fa-chevron-right"></i>',
                last:     '<i class="fa-solid fa-angles-right"></i>'
            }
        },
        pageLength: 25,
        lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
        dom: '<"nz-dt-top"<"nz-dt-top-left"l><"nz-dt-top-right"f>>rt<"nz-dt-bottom"<"nz-dt-bottom-left"i><"nz-dt-bottom-right"p>>',
        order: [[0, 'desc']],
        columnDefs: [
            { targets: [1], orderable: false },
            { targets: [5], orderable: false, searchable: false }
        ]
    });
});

function confirmarEliminacionVendida(id) {
    Swal.fire({
        title: '¿Eliminar propiedad?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((r) => {
        if (!r.isConfirmed) return;
        $.ajax({
            url: 'controllers/controller_propiedades.php',
            type: 'POST',
            data: { action: 'eliminar', id: id },
            success: function (response) {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminada',
                        showConfirmButton: false,
                        timer: 1200
                    }).then(() => location.reload());
                } else {
                    Swal.fire('Error', data.message || 'Error al eliminar', 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error');
            }
        });
    });
}

function verPropiedad(id) {
    $.ajax({
        url: 'controllers/controller_propiedades.php',
        type: 'GET',
        data: { action: 'obtener', id: id },
        success: function (response) {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            if (!data.success) {
                Swal.fire('Error', data.message || 'No se pudo cargar la propiedad', 'error');
                return;
            }
            const p = data.data;
            const rutaImg = (p.imagenes && p.imagenes.length > 0) ? p.imagenes[0].ruta_imagen : null;
            const cover = rutaImg
                ? `<img src="../${rutaImg}" alt="">`
                : `<div class="nz-detalle-placeholder"><i class="fa-solid fa-image"></i></div>`;

            const row = (label, value) => value
                ? `<div class="nz-detalle-row"><span class="nz-detalle-label">${label}</span><span class="nz-detalle-value">${value}</span></div>`
                : '';

            const html = `
                <div class="nz-detalle">
                    <div class="nz-detalle-cover">${cover}</div>
                    <div class="nz-detalle-body">
                        <h4 class="nz-detalle-title">${p.titulo}</h4>
                        ${row('Categoría', p.nombre_categoria || '')}
                        ${row('Localidad', p.localidad || '')}
                        ${row('Ubicación', p.ubicacion || '')}
                        ${row('Tamaño', p.tamanio || '')}
                        ${row('Servicios', p.servicios || '')}
                        ${row('Características', p.caracteristicas || '')}
                        ${row('Latitud', p.latitud || '')}
                        ${row('Longitud', p.longitud || '')}
                    </div>
                </div>
            `;
            $('#detallePropiedad').html(html);
            new bootstrap.Modal(document.getElementById('modalVerPropiedad')).show();
        },
        error: function () {
            Swal.fire('Error', 'Error al comunicarse con el servidor', 'error');
        }
    });
}
</script>

<style>
.nz-detalle {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: var(--nz-sp-5);
    align-items: start;
}
.nz-detalle-cover {
    border-radius: var(--nz-radius);
    overflow: hidden;
    border: 1px solid var(--nz-border);
    aspect-ratio: 1;
    background: var(--nz-surface-3);
}
.nz-detalle-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nz-detalle-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: var(--nz-text-muted);
    font-size: 2.2rem;
}
.nz-detalle-title {
    margin: 0 0 var(--nz-sp-4);
    color: var(--nz-text);
    font-size: var(--nz-fs-lg);
    font-weight: 700;
}
.nz-detalle-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--nz-sp-3);
    padding: var(--nz-sp-2) 0;
    border-bottom: 1px dashed var(--nz-border);
    font-size: var(--nz-fs-sm);
}
.nz-detalle-row:last-child { border-bottom: 0; }
.nz-detalle-label {
    color: var(--nz-text-muted);
    font-weight: 600;
    text-transform: uppercase;
    font-size: var(--nz-fs-xs);
    letter-spacing: .04em;
}
.nz-detalle-value { color: var(--nz-text); word-break: break-word; }
@media (max-width: 640px) {
    .nz-detalle { grid-template-columns: 1fr; }
    .nz-detalle-cover { max-width: 240px; }
    .nz-detalle-row { grid-template-columns: 1fr; gap: 2px; }
}
</style>

<?php require_once 'includes/footer.php'; ?>
