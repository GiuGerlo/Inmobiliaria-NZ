<!-- Modal Propiedad -->
<div class="modal fade" id="modalPropiedad" tabindex="-1" aria-labelledby="modalPropiedadLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalPropiedadLabel">
                    <i class="fa-solid fa-building"></i> Nueva propiedad
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <form id="formPropiedad" method="POST" enctype="multipart/form-data">
                <div class="modal-body">
                    <input type="hidden" name="id" id="propiedad_id">

                    <!-- Sección: Datos básicos -->
                    <div class="nz-form-section">
                        <div class="nz-form-section-head">
                            <i class="fa-solid fa-circle-info"></i>
                            <h6>Datos básicos</h6>
                        </div>
                        <div class="nz-form-section-body">
                            <div class="nz-form-grid">
                                <div class="nz-field-group full">
                                    <label for="titulo">Título <span class="req">*</span></label>
                                    <input type="text" class="nz-input" id="titulo" name="titulo" required>
                                </div>
                                <div class="nz-field-group">
                                    <label for="categoria">Categoría <span class="req">*</span></label>
                                    <select class="nz-select" id="categoria" name="categoria" required>
                                        <option value="">Seleccionar categoría</option>
                                        <?php
                                        $categorias = $db->query("SELECT * FROM tipos_propiedad ORDER BY nombre_categoria");
                                        while ($cat = $categorias->fetch_assoc()):
                                        ?>
                                            <option value="<?php echo (int)$cat['id']; ?>">
                                                <?php echo htmlspecialchars($cat['nombre_categoria']); ?>
                                            </option>
                                        <?php endwhile; ?>
                                    </select>
                                </div>
                                <div class="nz-field-group">
                                    <label for="localidad">Localidad</label>
                                    <input type="text" class="nz-input" id="localidad" name="localidad">
                                </div>
                                <div class="nz-field-group full">
                                    <label for="tamanio">Tamaño</label>
                                    <input type="text" class="nz-input" id="tamanio" name="tamanio" placeholder="Ej: 250 m²">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sección: Detalles -->
                    <div class="nz-form-section">
                        <div class="nz-form-section-head">
                            <i class="fa-solid fa-align-left"></i>
                            <h6>Detalles</h6>
                        </div>
                        <div class="nz-form-section-body">
                            <div class="nz-field-group" style="margin-bottom: var(--nz-sp-4);">
                                <label for="ubicacion">Ubicación</label>
                                <textarea class="nz-textarea" id="ubicacion" name="ubicacion" rows="3"></textarea>
                            </div>
                            <div class="nz-field-group" style="margin-bottom: var(--nz-sp-4);">
                                <label for="servicios">Servicios</label>
                                <textarea class="nz-textarea" id="servicios" name="servicios" rows="3"></textarea>
                                <small class="nz-field-hint">Separar con comas (ej: Agua, Luz, Gas)</small>
                            </div>
                            <div class="nz-field-group">
                                <label for="caracteristicas">Características</label>
                                <textarea class="nz-textarea" id="caracteristicas" name="caracteristicas" rows="3"></textarea>
                                <small class="nz-field-hint">Separar con comas (ej: 3 dormitorios, Pileta, Cochera)</small>
                            </div>
                        </div>
                    </div>

                    <!-- Sección: Ubicación en mapa -->
                    <div class="nz-form-section">
                        <div class="nz-form-section-head">
                            <i class="fa-solid fa-map-location-dot"></i>
                            <h6>Ubicación en mapa</h6>
                        </div>
                        <div class="nz-form-section-body">
                            <div class="nz-form-grid" style="margin-bottom: var(--nz-sp-4);">
                                <div class="nz-field-group">
                                    <label for="latitud">Latitud</label>
                                    <input type="text" class="nz-input" id="latitud" name="latitud" placeholder="-32.876820">
                                    <small class="nz-field-hint">Decimal, entre -90 y 90</small>
                                </div>
                                <div class="nz-field-group">
                                    <label for="longitud">Longitud</label>
                                    <input type="text" class="nz-input" id="longitud" name="longitud" placeholder="-61.026038">
                                    <small class="nz-field-hint">Decimal, entre -180 y 180</small>
                                </div>
                            </div>
                            <div class="nz-field-group">
                                <label for="mapa">Iframe de Google Maps</label>
                                <textarea class="nz-textarea" id="mapa" name="mapa" rows="3"
                                          placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>'></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Sección: Imágenes -->
                    <div class="nz-form-section">
                        <div class="nz-form-section-head">
                            <i class="fa-solid fa-images"></i>
                            <h6>Imágenes</h6>
                        </div>
                        <div class="nz-form-section-body">
                            <label for="imagenes" class="nz-file-drop">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                                <p>Click o arrastrá imágenes acá</p>
                                <small>JPG, PNG, GIF, WebP · se comprimen a 1920px antes de subir · máx 20</small>
                                <input type="file" id="imagenes" name="imagenes[]" multiple accept="image/*">
                            </label>
                            <div id="compression-status" class="nz-compress-status" hidden></div>
                            <div id="preview-imagenes" class="nz-img-preview-grid"></div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fa-solid fa-xmark"></i> Cancelar
                    </button>
                    <button type="submit" class="btn nz-btn-sm nz-btn-primary">
                        <i class="fa-solid fa-floppy-disk"></i> Guardar
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- browser-image-compression: cliente comprime y resize a WebP antes del upload -->
<script src="https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js"></script>

<style>
.nz-compress-status {
    margin-top: var(--nz-sp-3);
    padding: 8px 12px;
    background: var(--nz-surface-2);
    border: 1px solid var(--nz-border);
    border-radius: var(--nz-radius-sm);
    font-size: var(--nz-fs-sm);
    color: var(--nz-text-muted);
    display: flex;
    align-items: center;
    gap: 8px;
}
.nz-compress-status.is-done { color: var(--nz-success); background: var(--nz-success-soft); border-color: var(--nz-success); }
.nz-compress-badge {
    position: absolute;
    bottom: 6px;
    right: 6px;
    background: rgba(0,0,0,.7);
    color: white;
    font-size: .68rem;
    font-weight: 600;
    padding: 3px 6px;
    border-radius: var(--nz-radius-sm);
    letter-spacing: .02em;
    max-width: calc(100% - 12px);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.nz-compress-badge.is-ok   { background: var(--nz-success); }
.nz-compress-badge.is-warn { background: var(--nz-warning); }
</style>

<script>
    // Flag global: true mientras se comprime, bloquea submit en propiedades.php
    window.nzImagesReady = true;

    document.addEventListener('DOMContentLoaded', function() {
        const previewDiv = document.getElementById('preview-imagenes');
        const fileInput  = document.getElementById('imagenes');
        const dropZone   = fileInput ? fileInput.closest('.nz-file-drop') : null;
        let existingImages = [];

        // Preview de imágenes ya guardadas (modo edición). La primera es la "principal".
        function renderPreview() {
            previewDiv.innerHTML = '';
            existingImages.forEach((imagen, idx) => {
                const wrap = document.createElement('div');
                wrap.className = 'nz-img-preview' + (idx === 0 ? ' is-main' : '');
                wrap.dataset.id = imagen.id;
                wrap.innerHTML = `
                    <img src="../${imagen.ruta_imagen}" alt="" draggable="false">
                    ${idx === 0 ? '<span class="nz-img-badge">Principal</span>' : ''}
                    <span class="nz-img-handle" title="Arrastrar para reordenar"><i class="fa-solid fa-up-down-left-right"></i></span>
                    <button type="button" class="nz-img-preview-del" title="Eliminar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;
                wrap.querySelector('.nz-img-preview-del').addEventListener('click', () => eliminarImagen(imagen.id));
                previewDiv.appendChild(wrap);
            });

            // Sortable: drag-drop entre items, persistir orden en server
            if (window.Sortable && previewDiv._sortable) {
                previewDiv._sortable.destroy();
            }
            if (window.Sortable && existingImages.length > 1) {
                previewDiv._sortable = Sortable.create(previewDiv, {
                    animation: 150,
                    handle: '.nz-img-handle',
                    ghostClass: 'nz-img-ghost',
                    onEnd: function () {
                        const ids = Array.from(previewDiv.querySelectorAll('.nz-img-preview'))
                                         .map(el => parseInt(el.dataset.id, 10));
                        persistImageOrder(ids);
                    }
                });
            }
        }

        function persistImageOrder(ids) {
            $.ajax({
                url: 'controllers/controller_propiedades.php',
                type: 'POST',
                data: { action: 'update_image_order', imagenes: JSON.stringify(ids) },
                success: function (resp) {
                    const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
                    if (data.success) {
                        // Normalizar IDs a Number — server devuelve string, ids son number
                        existingImages.sort((a, b) =>
                            ids.indexOf(Number(a.id)) - ids.indexOf(Number(b.id))
                        );
                        renderPreview();
                    } else {
                        Swal.fire('Error', data.message || 'No se pudo guardar el orden', 'error');
                    }
                },
                error: function () {
                    Swal.fire('Error', 'No se pudo guardar el orden', 'error');
                }
            });
        }

        window.eliminarImagen = function(id) {
            Swal.fire({
                title: '¿Eliminar imagen?',
                text: 'No se puede deshacer.',
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
                    data: { action: 'eliminar_imagen', id: id },
                    success: function(response) {
                        const data = typeof response === 'string' ? JSON.parse(response) : response;
                        if (data.success) {
                            existingImages = existingImages.filter(img => img.id !== id);
                            renderPreview();
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminada',
                                showConfirmButton: false,
                                timer: 1000
                            });
                        } else {
                            Swal.fire('Error', data.message || 'No se pudo eliminar', 'error');
                        }
                    }
                });
            });
        };

        // Preview + compresión client-side de nuevas imágenes seleccionadas
        const statusEl = document.getElementById('compression-status');
        const MAX_FILES = 20;
        const COMPRESSION_OPTS = {
            maxSizeMB: 2,            // tope final ~2MB
            maxWidthOrHeight: 1920,  // resize si excede
            useWebWorker: true,
            initialQuality: 0.82,
            fileType: 'image/webp'   // entregar WebP al server (server igual hace fallback)
        };

        function fmtSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }

        async function compressAndPreview(files) {
            if (typeof imageCompression === 'undefined') {
                console.warn('browser-image-compression no cargado, subiendo sin comprimir');
                return Array.from(files);
            }

            window.nzImagesReady = false;
            const compressed = [];
            let totalOrig = 0;
            let totalNew  = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith('image/')) continue;

                const wrap = previewDiv.children[i];
                const statusBadge = wrap ? wrap.querySelector('.nz-compress-badge') : null;
                if (statusBadge) statusBadge.textContent = 'Comprimiendo...';

                try {
                    const out = await imageCompression(file, COMPRESSION_OPTS);
                    // Renombrar para preservar nombre base (server usa el name)
                    const safeName = file.name.replace(/\.[^.]+$/, '') + '.webp';
                    const renamed  = new File([out], safeName, { type: out.type, lastModified: Date.now() });
                    compressed.push(renamed);
                    totalOrig += file.size;
                    totalNew  += out.size;
                    if (statusBadge) {
                        statusBadge.textContent = `${fmtSize(file.size)} → ${fmtSize(out.size)}`;
                        statusBadge.classList.add('is-ok');
                    }
                } catch (err) {
                    console.error('Compresión fallida en', file.name, err);
                    compressed.push(file); // fallback: enviar original
                    if (statusBadge) {
                        statusBadge.textContent = 'Sin comprimir';
                        statusBadge.classList.add('is-warn');
                    }
                }
            }

            // Reemplazar input.files con los comprimidos
            const dt = new DataTransfer();
            compressed.forEach(f => dt.items.add(f));
            fileInput.files = dt.files;

            // Status global
            const saved = totalOrig - totalNew;
            const pct   = totalOrig > 0 ? Math.round((saved / totalOrig) * 100) : 0;
            statusEl.hidden = false;
            statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${compressed.length} imagen(es) lista(s) · ${fmtSize(totalOrig)} → ${fmtSize(totalNew)} (${pct}% menos)`;
            statusEl.classList.add('is-done');

            window.nzImagesReady = true;
            // Notificar al submit handler de propiedades.php
            document.dispatchEvent(new CustomEvent('nz:images-ready'));

            return compressed;
        }

        if (fileInput) {
            fileInput.addEventListener('change', function (e) {
                let files = Array.from(e.target.files || []);
                if (files.length === 0) return;

                if (files.length > MAX_FILES) {
                    Swal.fire('Demasiados archivos', `Máximo ${MAX_FILES} imágenes por subida. Se tomaron las primeras ${MAX_FILES}.`, 'warning');
                    files = files.slice(0, MAX_FILES);
                }

                previewDiv.innerHTML = '';
                existingImages = [];
                statusEl.hidden = false;
                statusEl.classList.remove('is-done');
                statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparando imágenes...';

                files.forEach((file) => {
                    if (!file.type.startsWith('image/')) return;
                    const wrap = document.createElement('div');
                    wrap.className = 'nz-img-preview';
                    wrap.innerHTML = `
                        <img alt="" draggable="false">
                        <span class="nz-compress-badge">En cola...</span>
                    `;
                    const reader = new FileReader();
                    reader.onload = (ev) => { wrap.querySelector('img').src = ev.target.result; };
                    reader.readAsDataURL(file);
                    previewDiv.appendChild(wrap);
                });

                compressAndPreview(files);
            });
        }

        // Drag & drop visual feedback
        if (dropZone) {
            ['dragenter', 'dragover'].forEach(evt => {
                dropZone.addEventListener(evt, (e) => {
                    e.preventDefault();
                    dropZone.classList.add('is-dragover');
                });
            });
            ['dragleave', 'drop'].forEach(evt => {
                dropZone.addEventListener(evt, (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('is-dragover');
                });
            });
        }

        // API global usada por editarPropiedad()
        window.actualizarPreviewImagenes = function(imagenes) {
            existingImages = imagenes;
            renderPreview();
        };
    });
</script>
