(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Login Form Handling
   */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const submitBtn = loginForm.querySelector('button[type=submit]');
    const submitBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    const setLoading = (on) => {
      if (!submitBtn) return;
      submitBtn.disabled = on;
      submitBtn.innerHTML = on
        ? '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Verificando...'
        : submitBtnHtml;
      loginForm.querySelectorAll('input').forEach(i => { i.disabled = on; });
    };

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // FormData primero, disable después (inputs disabled no entran en FormData).
      const formData = new FormData(loginForm);
      setLoading(true);

      fetch('auth.php', { method: 'POST', body: formData })
        .then(async response => {
          let data = {};
          try { data = await response.json(); } catch (_) { /* no-op */ }
          return { status: response.status, data: data };
        })
        .then(({ status, data }) => {
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Bienvenido!',
              text: 'Inicio de sesión exitoso',
              showConfirmButton: false,
              timer: 1200
            }).then(() => { window.location.href = 'admin/admin.php'; });
            return;
          }

          if (status === 429) {
            // Rate-limit: mostrar tiempo restante
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
            title: 'Error',
            text: data.message || 'Email o contraseña incorrectos.',
            confirmButtonColor: '#2c5f87'
          });
        })
        .catch(err => {
          console.error('Error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al procesar la solicitud.',
            confirmButtonColor: '#2c5f87'
          });
        })
        .finally(() => setLoading(false));
    });
  }

  /**
   * Toggle show/hide password (cualquier .toggle-password con data-target="#input-id")
   */
  document.querySelectorAll('.toggle-password').forEach(btn => {
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