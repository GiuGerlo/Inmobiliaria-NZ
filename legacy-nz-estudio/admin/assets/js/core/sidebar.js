/**
 * admin/assets/js/core/sidebar.js
 *
 * Maneja el toggle del sidebar:
 *  - Desktop (>768px): alterna entre full (252px) y mini (68px). Estado persistido en COOKIE
 *    (nz_sidebar_mini) para que PHP lo pinte server-side antes del primer paint y NO haya FOUC.
 *  - Mobile (<=768px): abre/cierra como off-canvas con backdrop.
 *
 * Botón: [data-nz-sidebar-toggle].
 */
(function () {
    'use strict';

    const COOKIE_KEY = 'nz_sidebar_mini';
    const MOBILE_MAX = 768;

    const body = document.body;
    if (!body) return;

    const isMobile = () => window.innerWidth <= MOBILE_MAX;

    function setCookie(name, value) {
        // 1 año, path raíz, SameSite Lax (no enviar cross-site).
        document.cookie = name + '=' + value + '; path=/; max-age=31536000; SameSite=Lax';
    }

    // NOTA: la clase nz-sidebar-mini ya viene aplicada por PHP si la cookie estaba activa
    // (ver admin/includes/head.php). No hace falta aplicarla acá: server-side es preferible
    // porque evita el flash de cambio post-load.

    function toggleSidebar() {
        if (isMobile()) {
            body.classList.toggle('nz-sidebar-open');
        } else {
            body.classList.toggle('nz-sidebar-mini');
            setCookie(COOKIE_KEY, body.classList.contains('nz-sidebar-mini') ? '1' : '0');
        }
    }

    // Botón en navbar
    document.querySelectorAll('[data-nz-sidebar-toggle]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });
    });

    // Click en backdrop cierra mobile
    document.querySelectorAll('.nz-sidebar-backdrop').forEach(b => {
        b.addEventListener('click', () => body.classList.remove('nz-sidebar-open'));
    });

    // Click en un link del sidebar cierra el off-canvas en mobile ANTES de navegar.
    // Sin esto, queda visiblemente abierto mientras se carga la próxima página.
    document.querySelectorAll('.nz-sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            if (isMobile()) body.classList.remove('nz-sidebar-open');
        });
    });

    // Reset clases al cruzar el breakpoint
    let wasMobile = isMobile();
    window.addEventListener('resize', () => {
        const nowMobile = isMobile();
        if (nowMobile !== wasMobile) {
            body.classList.remove('nz-sidebar-open');
            // En desktop, restaurar mini si la cookie lo pide. En mobile, quitar mini.
            if (!nowMobile) {
                const mini = document.cookie.split('; ').some(c => c === 'nz_sidebar_mini=1');
                body.classList.toggle('nz-sidebar-mini', mini);
            } else {
                body.classList.remove('nz-sidebar-mini');
            }
            wasMobile = nowMobile;
        }
    });

    // Escape cierra mobile
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') body.classList.remove('nz-sidebar-open');
    });
})();
