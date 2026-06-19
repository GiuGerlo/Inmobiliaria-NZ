<?php
require_once '../config/config.php';
require_once 'includes/head.php';

$query_categorias = "SELECT * FROM tipos_propiedad ORDER BY nombre_categoria";
$categorias = $db->query($query_categorias);
?>

<div class="nz-page">

    <header class="nz-page-header">
        <div class="nz-page-title">
            <div class="nz-page-title-icon"><i class="fa-solid fa-arrows-up-down"></i></div>
            <div>
                <h1>Ordenar propiedades</h1>
                <p>Arrastrá las propiedades para definir el orden en el catálogo público</p>
            </div>
        </div>
        <a href="propiedades.php" class="nz-btn-sm nz-btn-ghost">
            <i class="fa-solid fa-arrow-left"></i> Volver
        </a>
    </header>

    <div class="nz-order-grid">
        <?php
        $stmt_props_orden = $db->prepare("SELECT id, titulo, orden FROM propiedades WHERE categoria = ? ORDER BY orden ASC, id DESC");
        while ($categoria = $categorias->fetch_assoc()):
            $stmt_props_orden->bind_param('i', $categoria['id']);
            $stmt_props_orden->execute();
            $propiedades = $stmt_props_orden->get_result();
        ?>
            <section class="nz-card nz-order-card">
                <header class="nz-card-header">
                    <h5><?php echo htmlspecialchars($categoria['nombre_categoria']); ?></h5>
                    <span class="nz-cat-pill"><?php echo (int)$propiedades->num_rows; ?></span>
                </header>
                <div class="nz-card-body" style="padding: var(--nz-sp-3);">
                    <ul class="nz-sortable" data-categoria="<?php echo (int)$categoria['id']; ?>">
                        <?php if ($propiedades->num_rows === 0): ?>
                            <li class="nz-sort-empty">Sin propiedades en esta categoría</li>
                        <?php else: ?>
                            <?php while ($propiedad = $propiedades->fetch_assoc()): ?>
                                <li class="nz-sort-item" data-id="<?php echo (int)$propiedad['id']; ?>">
                                    <i class="fa-solid fa-grip-vertical nz-sort-handle" aria-hidden="true"></i>
                                    <span class="nz-sort-title"><?php echo htmlspecialchars($propiedad['titulo']); ?></span>
                                    <span class="nz-sort-id">#<?php echo (int)$propiedad['id']; ?></span>
                                </li>
                            <?php endwhile; ?>
                        <?php endif; ?>
                    </ul>
                </div>
            </section>
        <?php endwhile; ?>
    </div>
</div>

<style>
.nz-order-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--nz-sp-5);
}
.nz-order-card .nz-card-header { background: var(--nz-surface-2); }
.nz-sortable {
    list-style: none;
    margin: 0;
    padding: 0;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.nz-sort-item {
    display: flex;
    align-items: center;
    gap: var(--nz-sp-3);
    padding: 10px 12px;
    background: var(--nz-surface);
    border: 1px solid var(--nz-border);
    border-radius: var(--nz-radius-sm);
    cursor: grab;
    transition: border-color var(--nz-transition-fast), background var(--nz-transition-fast), box-shadow var(--nz-transition-fast);
}
.nz-sort-item:hover {
    border-color: var(--nz-primary);
    background: var(--nz-primary-soft);
}
.nz-sort-item:active { cursor: grabbing; }
.nz-sort-handle {
    color: var(--nz-text-muted);
    font-size: .85rem;
    cursor: grab;
    flex-shrink: 0;
}
.nz-sort-title {
    flex: 1;
    font-size: var(--nz-fs-sm);
    font-weight: 500;
    color: var(--nz-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.nz-sort-id {
    font-size: var(--nz-fs-xs);
    color: var(--nz-text-muted);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
}
.nz-sort-empty {
    padding: var(--nz-sp-4);
    text-align: center;
    color: var(--nz-text-muted);
    font-size: var(--nz-fs-sm);
    font-style: italic;
}
.nz-sort-ghost {
    opacity: .35;
    background: var(--nz-primary-soft);
    border-color: var(--nz-primary);
}
.nz-sort-chosen {
    background: var(--nz-surface);
    box-shadow: var(--nz-shadow-md);
    border-color: var(--nz-primary);
}
.nz-sort-drag { box-shadow: var(--nz-shadow-lg); }
</style>

<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2400,
        timerProgressBar: true
    });

    document.querySelectorAll('.nz-sortable').forEach(function (el) {
        new Sortable(el, {
            group: 'propiedades',
            animation: 150,
            handle: '.nz-sort-handle',
            ghostClass: 'nz-sort-ghost',
            chosenClass: 'nz-sort-chosen',
            dragClass: 'nz-sort-drag',
            onEnd: function (evt) { updateOrder(evt.to); }
        });
    });

    function updateOrder(container) {
        const items = container.querySelectorAll('.nz-sort-item');
        const ordenData = Array.from(items).map((item, index) => ({
            id: item.dataset.id,
            orden: index + 1
        }));

        if (ordenData.length === 0) return;

        fetch('controllers/controller_propiedades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_order',
                categoria: container.dataset.categoria,
                orden: ordenData
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                Toast.fire({ icon: 'success', title: 'Orden actualizado' });
            } else {
                Swal.fire('Error', data.message || 'No se pudo actualizar el orden', 'error');
            }
        })
        .catch(() => Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error'));
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>
