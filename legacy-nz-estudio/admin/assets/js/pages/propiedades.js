/**
 * admin/assets/js/pages/propiedades.js
 *
 * Lógica de la página de propiedades (admin):
 *   - DataTable con dom custom, paginación, ordenamiento.
 *   - Búsqueda libre full-text con debounce (incluye campos no visibles).
 *   - Filtros dropdown cross-linked: categoría ↔ localidad.
 *   - Export CSV vía DataTables Buttons.
 *   - CRUD (editar, eliminar, marcar vendida) y submit con compresión client-side.
 *
 * Dependencias DOM:
 *   #tablaPropiedades   — tabla con <tr data-cat="…" data-loc="…">
 *   #busquedaGlobal     — input de búsqueda libre
 *   #filtroCategoria    — <select> categoría
 *   #filtroLocalidad    — <select> localidad
 *   #btnLimpiarFiltros  — botón reset
 *   #btnExportCsv       — botón CSV
 *   #filtroInfo         — banner "filtros activos · X de Y"
 *   #formPropiedad      — form del modal (modal_propiedad.php)
 *
 * Dependencias globales:
 *   jQuery, DataTables (+ Buttons + html5), Bootstrap modal, SweetAlert2.
 */
(function () {
    'use strict';

    // ─── Refs DOM (cacheados al ready) ────────────────────────────────────
    let dt;
    const $busq    = () => $('#busquedaGlobal');
    const $selCat  = () => $('#filtroCategoria');
    const $selLoc  = () => $('#filtroLocalidad');
    const $info    = () => $('#filtroInfo');

    // ─── Cross-filter: recalcular opciones del OTRO dropdown ──────────────

    /**
     * Devuelve el set de valores únicos de `attr` entre las filas que
     * matchean la condición `match`.
     * @param {string} attr   - 'cat' | 'loc'
     * @param {(tr: HTMLTableRowElement) => boolean} match
     */
    function valoresUnicos(attr, match) {
        const set = new Set();
        document.querySelectorAll('#tablaPropiedades tbody tr').forEach(tr => {
            if (!match(tr)) return;
            const val = tr.dataset[attr];
            if (val) set.add(val);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
    }

    /**
     * Reescribe las <option> de un <select> preservando selección si
     * sigue siendo válida.
     */
    function actualizarSelect($sel, valores, placeholder) {
        const actual = $sel.val();
        const opciones = ['<option value="">' + placeholder + '</option>']
            .concat(valores.map(v => `<option value="${escHtml(v)}">${escHtml(v)}</option>`));
        $sel.html(opciones.join(''));
        // Restaurar selección si sigue disponible
        if (actual && valores.includes(actual)) {
            $sel.val(actual);
        }
    }

    function escHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    /**
     * Recalcula opciones del dropdown opuesto al que cambió:
     *   - Si cambia categoría → recalcular localidades compatibles.
     *   - Si cambia localidad → recalcular categorías compatibles.
     */
    function refrescarDropdownsCross(origen) {
        const cat = $selCat().val();
        const loc = $selLoc().val();

        if (origen !== 'localidad') {
            // Actualizar opciones de localidad según categoría
            const locs = valoresUnicos('loc', tr => !cat || tr.dataset.cat === cat);
            actualizarSelect($selLoc(), locs, 'Todas las localidades');
        }
        if (origen !== 'categoria') {
            // Actualizar opciones de categoría según localidad
            const cats = valoresUnicos('cat', tr => !loc || tr.dataset.loc === loc);
            actualizarSelect($selCat(), cats, 'Todas las categorías');
        }
    }

    // ─── DataTables: custom search para los dropdowns ─────────────────────
    function registrarCustomSearch() {
        $.fn.dataTable.ext.search.push(function (settings, searchData) {
            if (settings.nTable.id !== 'tablaPropiedades') return true;

            const cat = $selCat().val();
            const loc = $selLoc().val();
            const rowCat = (searchData[3] || '').trim();
            const rowLoc = (searchData[4] || '').trim();

            if (cat && rowCat !== cat) return false;
            if (loc && rowLoc !== loc) return false;
            return true;
        });
    }

    // ─── DataTables: init ─────────────────────────────────────────────────
    function initDataTable() {
        return $('#tablaPropiedades').DataTable({
            responsive: true,
            language: {
                decimal: ',',
                thousands: '.',
                emptyTable: 'No hay propiedades',
                info: 'Mostrando _START_ a _END_ de _TOTAL_ propiedades',
                infoEmpty: 'Mostrando 0 propiedades',
                infoFiltered: '(filtrado de _MAX_ totales)',
                lengthMenu: 'Mostrar _MENU_',
                loadingRecords: 'Cargando...',
                processing: 'Procesando...',
                zeroRecords: 'Sin resultados con los filtros aplicados',
                paginate: {
                    first:    '<i class="fa-solid fa-angles-left"></i>',
                    previous: '<i class="fa-solid fa-chevron-left"></i>',
                    next:     '<i class="fa-solid fa-chevron-right"></i>',
                    last:     '<i class="fa-solid fa-angles-right"></i>'
                },
                aria: {
                    sortAscending: ': activar para orden ascendente',
                    sortDescending: ': activar para orden descendente'
                }
            },
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
            dom: '<"nz-dt-top"<"nz-dt-top-left"l>>rt<"nz-dt-bottom"<"nz-dt-bottom-left"i><"nz-dt-bottom-right"p>>',
            order: [[0, 'desc']],
            columnDefs: [
                { targets: [1], orderable: false, searchable: false },
                { targets: [5], orderable: false, searchable: false },
                { targets: [6], visible: false, searchable: true } // blob hidden
            ],
            buttons: [
                {
                    extend: 'csv',
                    text: '<i class="fa-solid fa-file-csv"></i> CSV',
                    filename: () => 'propiedades_' + new Date().toISOString().slice(0, 10),
                    exportOptions: { columns: [0, 2, 3, 4] }
                }
            ]
        });
    }

    // ─── Banner "filtros activos" ─────────────────────────────────────────
    function actualizarBanner() {
        const cat = $selCat().val();
        const loc = $selLoc().val();
        const txt = $busq().val();
        const info = dt.page.info();

        const partes = [];
        if (txt) partes.push(`"${escHtml(txt)}"`);
        if (cat) partes.push(`Categoría: ${escHtml(cat)}`);
        if (loc) partes.push(`Localidad: ${escHtml(loc)}`);

        if (partes.length === 0) {
            $info().attr('hidden', true).empty();
            return;
        }
        $info()
            .removeAttr('hidden')
            .html(
                `<i class="fa-solid fa-filter"></i> Filtros activos: ${partes.join(' · ')} ` +
                `<span class="nz-filter-count">${info.recordsDisplay} de ${info.recordsTotal}</span>`
            );
    }

    // ─── Wiring de inputs ─────────────────────────────────────────────────
    function wireFiltros() {
        // Búsqueda libre con debounce
        let timer = null;
        $busq().on('input', function () {
            const v = this.value;
            clearTimeout(timer);
            timer = setTimeout(() => dt.search(v).draw(), 200);
        });

        // Dropdowns: redibujar + recalcular opciones del otro
        $selCat().on('change', function () {
            refrescarDropdownsCross('categoria');
            dt.draw();
        });
        $selLoc().on('change', function () {
            refrescarDropdownsCross('localidad');
            dt.draw();
        });

        // Limpiar todo
        $('#btnLimpiarFiltros').on('click', function () {
            $busq().val('');
            $selCat().val('');
            $selLoc().val('');
            refrescarDropdownsCross();   // reset full
            dt.search('').draw();
        });

        // CSV
        $('#btnExportCsv').on('click', function () {
            dt.button(0).trigger();
        });
    }

    // ─── CRUD: acciones inline (editar / vender / eliminar) ───────────────
    function postAction(action, id, onOk) {
        $.ajax({
            url: 'controllers/controller_propiedades.php',
            type: 'POST',
            data: { action, id },
            success: function (response) {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                if (data.success) onOk(data);
                else Swal.fire('Error', data.message || 'Operación fallida', 'error');
            },
            error: function () {
                Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error');
            }
        });
    }

    window.confirmarEliminacion = function (id) {
        Swal.fire({
            title: '¿Eliminar propiedad?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(r => {
            if (!r.isConfirmed) return;
            postAction('eliminar', id, () => {
                Swal.fire({ icon: 'success', title: 'Eliminada', showConfirmButton: false, timer: 1200 })
                    .then(() => location.reload());
            });
        });
    };

    window.marcarVendida = function (id) {
        Swal.fire({
            title: '¿Marcar como vendida?',
            text: 'La propiedad se moverá a la sección de vendidas.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, marcar',
            cancelButtonText: 'Cancelar'
        }).then(r => {
            if (!r.isConfirmed) return;
            postAction('vender', id, () => {
                Swal.fire({ icon: 'success', title: 'Marcada como vendida', showConfirmButton: false, timer: 1200 })
                    .then(() => location.reload());
            });
        });
    };

    window.editarPropiedad = function (id) {
        $('#modalPropiedadLabel').text('Editar propiedad');

        $.ajax({
            url: 'controllers/controller_propiedades.php',
            type: 'GET',
            data: { action: 'obtener', id },
            success: function (response) {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                if (!data.success) {
                    Swal.fire('Error', data.message || 'No se pudo cargar la propiedad', 'error');
                    return;
                }
                const p = data.data;
                $('#propiedad_id').val(p.id);
                $('#titulo').val(p.titulo);
                $('#categoria').val(p.categoria);
                $('#localidad').val(p.localidad);
                $('#ubicacion').val(p.ubicacion);
                $('#tamanio').val(p.tamanio);
                $('#servicios').val(p.servicios);
                $('#caracteristicas').val(p.caracteristicas);
                $('#mapa').val(p.mapa);
                $('#latitud').val(p.latitud);
                $('#longitud').val(p.longitud);

                if (p.imagenes && window.actualizarPreviewImagenes) {
                    window.actualizarPreviewImagenes(p.imagenes);
                }

                new bootstrap.Modal(document.getElementById('modalPropiedad')).show();
            },
            error: function () {
                Swal.fire('Error', 'Error al comunicarse con el servidor', 'error');
            }
        });
    };

    // ─── Form submit con espera de compresión client-side ─────────────────
    function wireFormSubmit() {
        $('#formPropiedad').on('submit', async function (e) {
            e.preventDefault();
            const $btn   = $(this).find('button[type=submit]');
            const btnOrg = $btn.html();
            $btn.prop('disabled', true);

            if (window.nzImagesReady === false) {
                $btn.html('<i class="fa-solid fa-spinner fa-spin"></i> Esperando imágenes...');
                await new Promise(res => document.addEventListener('nz:images-ready', res, { once: true }));
            }

            $btn.html('<i class="fa-solid fa-spinner fa-spin"></i> Guardando...');
            const formData = new FormData(this);

            $.ajax({
                url: 'controllers/controller_propiedades.php',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Listo!',
                            text: data.message,
                            showConfirmButton: false,
                            timer: 1400
                        }).then(() => location.reload());
                    } else {
                        Swal.fire('Error', data.message || 'No se pudo guardar', 'error');
                    }
                },
                error: function () {
                    Swal.fire('Error', 'Error en la comunicación con el servidor', 'error');
                },
                complete: function () {
                    $btn.prop('disabled', false).html(btnOrg);
                }
            });
        });

        // Reset al cerrar modal
        $('#modalPropiedad').on('hidden.bs.modal', function () {
            $('#formPropiedad')[0].reset();
            $('#preview-imagenes').html('');
            $('#propiedad_id').val('');
            $('#modalPropiedadLabel').text('Nueva propiedad');
            const status = document.getElementById('compression-status');
            if (status) { status.hidden = true; status.classList.remove('is-done'); }
            window.nzImagesReady = true;
        });
    }

    // ─── Bootstrap ────────────────────────────────────────────────────────
    $(function () {
        registrarCustomSearch();
        dt = initDataTable();
        wireFiltros();
        wireFormSubmit();
        dt.on('draw', actualizarBanner);
    });
})();
