/* login.js — handler del form de login standalone.
   Carga sólo en login.php. No depende de jQuery; sí de Swal y Bootstrap (CSS).
*/
(function () {
    'use strict';

    const form = document.getElementById('loginForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type=submit]');
    const submitBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    function setLoading(on) {
        if (!submitBtn) return;
        submitBtn.disabled = on;
        submitBtn.innerHTML = on
            ? '<span class="nz-spinner" aria-hidden="true"></span> Verificando...'
            : submitBtnHtml;
        form.querySelectorAll('input').forEach(i => { i.disabled = on; });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Construir FormData ANTES de disable: los inputs disabled no entran
        // en FormData → el csrf_token se perdería.
        const formData = new FormData(form);
        setLoading(true);

        fetch('auth.php', { method: 'POST', body: formData })
            .then(async response => {
                let data = {};
                try { data = await response.json(); } catch (_) { /* no-op */ }
                return { status: response.status, data };
            })
            .then(({ status, data }) => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: 'Inicio de sesión exitoso',
                        showConfirmButton: false,
                        timer: 1100
                    }).then(() => { window.location.href = 'admin/admin.php'; });
                    return;
                }

                if (status === 429) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Demasiados intentos',
                        text: data.message || 'Esperá unos minutos antes de reintentar.',
                        confirmButtonColor: '#2c5f87'
                    });
                    return;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo iniciar sesión',
                    text: data.message || 'Email o contraseña incorrectos.',
                    confirmButtonColor: '#2c5f87'
                });
            })
            .catch(err => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo comunicar con el servidor.',
                    confirmButtonColor: '#2c5f87'
                });
            })
            .finally(() => setLoading(false));
    });

    // Toggle show/hide password
    document.querySelectorAll('.nz-toggle[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.querySelector(btn.dataset.target);
            if (!target) return;
            const showing = target.type === 'text';
            target.type = showing ? 'password' : 'text';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-eye', showing);
                icon.classList.toggle('bi-eye-slash', !showing);
            }
        });
    });
})();
