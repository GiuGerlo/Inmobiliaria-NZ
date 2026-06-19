/**
 * admin/assets/js/core/csrf.js
 *
 * Inyecta automáticamente el token CSRF como header X-CSRF-Token en
 * todos los requests AJAX (jQuery $.ajax) y fetch() de las páginas del admin.
 *
 * Lee el token de <meta name="csrf-token" content="...">, que debe estar
 * presente en el <head> de cada página del admin (lo agrega head.php).
 *
 * Si el server responde 403 con motivo CSRF, alerta al usuario y recarga.
 */
(function () {
    'use strict';

    function getToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    }

    function handleCsrfFailure() {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Sesión expirada',
                text: 'Tu sesión expiró o el token de seguridad cambió. Vamos a recargar la página.',
                confirmButtonText: 'OK'
            }).then(() => location.reload());
        } else {
            alert('Sesión expirada. La página se va a recargar.');
            location.reload();
        }
    }

    // jQuery: inyectar en cada $.ajax
    if (typeof window.jQuery !== 'undefined') {
        window.jQuery.ajaxSetup({
            beforeSend: function (xhr, settings) {
                // Sólo en métodos que mutan estado
                const method = (settings.type || 'GET').toUpperCase();
                if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
                    xhr.setRequestHeader('X-CSRF-Token', getToken());
                }
            }
        });

        // Detectar 403 con motivo CSRF
        window.jQuery(document).ajaxError(function (_event, xhr) {
            if (xhr.status === 403) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data && data.message && /csrf/i.test(data.message)) {
                        handleCsrfFailure();
                    }
                } catch (_e) { /* no-op */ }
            }
        });
    }

    // fetch() nativo: monkey-patch para agregar header X-CSRF-Token
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        init = init || {};
        const method = (init.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();

        if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
            const headers = new Headers(init.headers || {});
            headers.set('X-CSRF-Token', getToken());
            init.headers = headers;
        }

        return originalFetch(input, init).then(response => {
            if (response.status === 403) {
                // Clonamos para no romper el consumo del body downstream
                response.clone().json().then(data => {
                    if (data && data.message && /csrf/i.test(data.message)) {
                        handleCsrfFailure();
                    }
                }).catch(() => { /* no-op */ });
            }
            return response;
        });
    };
})();
