<?php
require_once '../config/config.php';

$includeDataTablesStyles = true;
include_once 'includes/head.php';

require_once 'controllers/controller_categorias.php';
$controller = new ControllerCategorias($db);
$resultado  = $controller->obtenerCategorias();
$categorias = $resultado['data'] ?? null;
?>

<div class="nz-page">

    <header class="nz-page-header">
        <div class="nz-page-title">
            <div class="nz-page-title-icon"><i class="fa-solid fa-tags"></i></div>
            <div>
                <h1>Categorías</h1>
                <p>Tipos de propiedad disponibles en el catálogo</p>
            </div>
        </div>
        <button type="button" class="nz-btn-sm nz-btn-primary" data-bs-toggle="modal" data-bs-target="#categoriaModal">
            <i class="fa-solid fa-plus"></i> Nueva categoría
        </button>
    </header>

    <section class="nz-card">
        <div class="nz-card-body" style="padding: var(--nz-sp-4);">
            <div class="nz-table-wrap">
                <table id="tablaCategorias" class="table align-middle" style="width:100%">
                    <thead>
                        <tr>
                            <th style="width: 80px;">#</th>
                            <th>Nombre</th>
                            <th style="width: 160px;">Propiedades</th>
                            <th style="width: 120px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($categorias && $categorias->num_rows > 0): ?>
                            <?php while ($categoria = $categorias->fetch_assoc()): ?>
                                <tr>
                                    <td class="nz-id" data-order="<?php echo (int)$categoria['id']; ?>">#<?php echo (int)$categoria['id']; ?></td>
                                    <td style="font-weight: 600;"><?php echo htmlspecialchars($categoria['nombre_categoria']); ?></td>
                                    <td>
                                        <span class="nz-cat-pill">
                                            <?php echo (int)$categoria['total_propiedades']; ?>
                                            <?php echo $categoria['total_propiedades'] == 1 ? 'propiedad' : 'propiedades'; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="nz-table-actions" style="justify-content:center;width:100%;">
                                            <button type="button" class="nz-icon-btn editar-categoria"
                                                    data-id="<?php echo (int)$categoria['id']; ?>"
                                                    data-nombre="<?php echo htmlspecialchars($categoria['nombre_categoria'], ENT_QUOTES); ?>"
                                                    title="Editar categoría">
                                                <i class="fa-solid fa-pen"></i>
                                            </button>
                                            <?php if ($categoria['total_propiedades'] == 0): ?>
                                                <button type="button" class="nz-icon-btn nz-icon-btn--danger eliminar-categoria"
                                                        data-id="<?php echo (int)$categoria['id']; ?>"
                                                        data-nombre="<?php echo htmlspecialchars($categoria['nombre_categoria'], ENT_QUOTES); ?>"
                                                        title="Eliminar categoría">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            <?php else: ?>
                                                <button type="button" class="nz-icon-btn" disabled
                                                        style="opacity:.4;cursor:not-allowed;"
                                                        title="No se puede eliminar: tiene propiedades asociadas">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</div>

<!-- Modal crear/editar categoría -->
<div class="modal fade" id="categoriaModal" tabindex="-1" aria-labelledby="categoriaModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="categoriaModalLabel">
                    <i class="fa-solid fa-tags"></i> Nueva categoría
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <form id="formCategoria">
                <div class="modal-body">
                    <input type="hidden" id="categoria_id" name="id" value="">
                    <input type="hidden" id="accion" name="accion" value="crear">

                    <div class="nz-field-group">
                        <label for="nombre_categoria">Nombre de la categoría <span class="req">*</span></label>
                        <input type="text" class="nz-input" id="nombre_categoria" name="nombre_categoria"
                               placeholder="Ej: Casas, Terrenos, Cocheras..." required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="btnGuardar">Crear</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const formCategoria   = document.getElementById('formCategoria');
    const categoriaModalEl = document.getElementById('categoriaModal');
    const categoriaModal  = new bootstrap.Modal(categoriaModalEl);
    const modalTitle      = document.getElementById('categoriaModalLabel');
    const btnGuardar      = document.getElementById('btnGuardar');

    $(document).ready(function () {
        $('#tablaCategorias').DataTable({
            responsive: true,
            language: {
                emptyTable: 'No hay categorías',
                info: 'Mostrando _START_ a _END_ de _TOTAL_ categorías',
                infoEmpty: 'Mostrando 0 categorías',
                infoFiltered: '(filtrado de _MAX_ totales)',
                lengthMenu: 'Mostrar _MENU_',
                search: '',
                searchPlaceholder: 'Buscar categoría...',
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
            order: [[0, 'asc']],
            columnDefs: [
                { targets: [3], orderable: false, searchable: false }
            ]
        });
    });

    // Submit crear / actualizar
    formCategoria.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(formCategoria);

        btnGuardar.disabled = true;
        const txtOriginal = btnGuardar.textContent;
        btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

        fetch('controllers/controller_categorias.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.estado === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Listo!',
                        text: data.mensaje,
                        timer: 1400,
                        showConfirmButton: false
                    }).then(() => location.reload());
                } else {
                    Swal.fire('Error', data.mensaje || 'No se pudo guardar', 'error');
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error'))
            .finally(() => {
                btnGuardar.disabled = false;
                btnGuardar.textContent = txtOriginal;
            });
    });

    // Reset al cerrar el modal
    categoriaModalEl.addEventListener('hidden.bs.modal', function () {
        formCategoria.reset();
        document.getElementById('categoria_id').value = '';
        document.getElementById('accion').value = 'crear';
        modalTitle.innerHTML = '<i class="fa-solid fa-tags"></i> Nueva categoría';
        btnGuardar.textContent = 'Crear';
    });

    // Editar
    document.querySelectorAll('.editar-categoria').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('categoria_id').value = this.dataset.id;
            document.getElementById('nombre_categoria').value = this.dataset.nombre;
            document.getElementById('accion').value = 'actualizar';
            modalTitle.innerHTML = '<i class="fa-solid fa-pen"></i> Editar categoría';
            btnGuardar.textContent = 'Actualizar';
            categoriaModal.show();
        });
    });

    // Eliminar con doble confirmación
    document.querySelectorAll('.eliminar-categoria').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            const nombre = this.dataset.nombre;

            Swal.fire({
                title: '¿Eliminar categoría?',
                text: `Se va a eliminar "${nombre}". Esta acción no se puede deshacer.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (!result.isConfirmed) return;

                const formData = new FormData();
                formData.append('accion', 'eliminar');
                formData.append('id', id);

                fetch('controllers/controller_categorias.php', { method: 'POST', body: formData })
                    .then(r => r.json())
                    .then(data => {
                        if (data.estado === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminada',
                                showConfirmButton: false,
                                timer: 1200
                            }).then(() => location.reload());
                        } else {
                            Swal.fire('Error', data.mensaje, 'error');
                        }
                    })
                    .catch(() => Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error'));
            });
        });
    });
});
</script>

<?php include_once 'includes/footer.php'; ?>
