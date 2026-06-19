// Mostrar la hora actual en Argentina (UTC-3)
function actualizarHora() {
    const ahora = new Date();
    
    // Configurar para Argentina (UTC-3)
    const opcionesHora = { 
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const opcionesFecha = {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    const horaActual = ahora.toLocaleTimeString('es-AR', opcionesHora);
    const fechaActual = ahora.toLocaleDateString('es-AR', opcionesFecha);
    
    // Si existe un elemento para mostrar la hora, actualizarlo
    const elementoHora = document.getElementById('hora-actual');
    if (elementoHora) {
        elementoHora.textContent = `${fechaActual} - ${horaActual}`;
    }
    
    // Actualizar cada segundo
    setTimeout(actualizarHora, 1000);
}

// Inicializar DataTables con configuración común
function initDataTable(tableId, options = {}) {
    // Configuración predeterminada
    const defaultOptions = {
        responsive: true,
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        dom: '<"d-flex justify-content-between align-items-center mb-3"<"d-flex align-items-center"l><"d-flex align-items-center"f>>rt<"d-flex justify-content-between align-items-center"<"d-flex align-items-center"i><"d-flex align-items-center"p>>',
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        order: [[0, 'asc']]
    };
    
    // Combinar opciones predeterminadas con opciones personalizadas
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Inicializar DataTable
    return $(tableId).DataTable(mergedOptions);
}

// Agregar botones de exportación a DataTables
function addExportButtons(dataTable, title = 'Datos') {
    // Configuración de botones de exportación
    const exportButtons = {
        buttons: [
            {
                extend: 'collection',
                text: '<i class="fas fa-download me-1"></i> Exportar',
                className: 'btn-custom-blue',
                buttons: [
                    {
                        extend: 'excel',
                        text: '<i class="fas fa-file-excel me-1"></i> Excel',
                        exportOptions: {
                            columns: ':not(:last-child)'
                        },
                        title: title
                    },
                    {
                        extend: 'pdf',
                        text: '<i class="fas fa-file-pdf me-1"></i> PDF',
                        exportOptions: {
                            columns: ':not(:last-child)'
                        },
                        title: title
                    },
                    {
                        extend: 'print',
                        text: '<i class="fas fa-print me-1"></i> Imprimir',
                        exportOptions: {
                            columns: ':not(:last-child)'
                        },
                        title: title
                    }
                ]
            }
        ]
    };
    
    // Crear y agregar botones
    new $.fn.dataTable.Buttons(dataTable, exportButtons);
    dataTable.buttons().container().appendTo(`#${dataTable.table().node().id}_wrapper .dt-buttons`);
    
    return dataTable;
}

// El toggle del sidebar se maneja en core/sidebar.js.
// Acá solo arrancamos el reloj si la página lo usa.
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('hora-actual')) {
        actualizarHora();
    }
});