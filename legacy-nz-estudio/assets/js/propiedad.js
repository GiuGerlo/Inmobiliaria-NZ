document.addEventListener('DOMContentLoaded', function() {
        // Manejo de thumbnails del carrusel
        const thumbnails = document.querySelectorAll('.thumbnail-item');
        const carousel = document.querySelector('#propertyCarousel');

        if (thumbnails.length > 0 && carousel) {
            thumbnails.forEach((thumbnail, index) => {
                thumbnail.addEventListener('click', function() {
                    // Remover clase active de todos los thumbnails
                    thumbnails.forEach(t => t.classList.remove('active'));
                    // Agregar clase active al thumbnail clickeado
                    this.classList.add('active');
                });
            });

            // Actualizar thumbnail activo cuando cambia el slide
            carousel.addEventListener('slide.bs.carousel', function(e) {
                thumbnails.forEach(t => t.classList.remove('active'));
                if (thumbnails[e.to]) {
                    thumbnails[e.to].classList.add('active');
                }
            });
        }

        // Precargar imágenes del carrusel
        const carouselImages = document.querySelectorAll('#propertyCarousel img');
        carouselImages.forEach(img => {
            const imagePreloader = new Image();
            imagePreloader.src = img.src;
        });
    });

    // Función para compartir la propiedad
    function shareProperty() {
        const propertyTitle = "<?php echo addslashes($propiedad['titulo']); ?>";
        const propertyUrl = window.location.href;

        if (navigator.share) {
            // API Web Share (móviles modernos)
            navigator.share({
                title: propertyTitle,
                text: 'Mira esta propiedad que encontré',
                url: propertyUrl
            }).catch(console.error);
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(propertyUrl).then(function() {
                // Mostrar notificación
                showNotification('Enlace copiado al portapapeles', 'success');
            }).catch(function() {
                // Fallback del fallback: abrir ventana de compartir
                const shareText = encodeURIComponent(`${propertyTitle} - ${propertyUrl}`);
                window.open(`https://wa.me/?text=${shareText}`, '_blank');
            });
        }
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification-toast`;
        notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
        notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-check-circle me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Manejo de errores de imágenes
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'assets/img/no-image.jpg';
            this.alt = 'Imagen no disponible';
        });
    });

    // Analytics y tracking (opcional)
    function trackPropertyView() {
        // Aquí puedes agregar código de Google Analytics o similar
        if (typeof gtag !== 'undefined') {
            gtag('event', 'property_view', {
                'property_id': window.propertyData?.id || '',
                'property_title': window.propertyData?.titulo || '',
                'property_category': window.propertyData?.nombre_categoria || ''
            });
        }
    }

    // Ejecutar tracking al cargar la página
    trackPropertyView();

    // Funciones de utilidad para el carrusel
    function goToSlide(slideIndex) {
        const carousel = bootstrap.Carousel.getInstance(document.querySelector('#propertyCarousel'));
        if (carousel) {
            carousel.to(slideIndex);
        }
    }

    function nextSlide() {
        const carousel = bootstrap.Carousel.getInstance(document.querySelector('#propertyCarousel'));
        if (carousel) {
            carousel.next();
        }
    }

    function prevSlide() {
        const carousel = bootstrap.Carousel.getInstance(document.querySelector('#propertyCarousel'));
        if (carousel) {
            carousel.prev();
        }
    }

    // Ajuste dinámico de object-fit según tamaño de imagen
    document.addEventListener('DOMContentLoaded', function() {
        function setObjectFit(img) {
            // Usar Math.round para evitar problemas de decimales
            const w = Math.round(img.naturalWidth);
            const h = Math.round(img.naturalHeight);
            if (w >= 1024 && h >= 768) {
                img.style.objectFit = 'cover';
            } else {
                img.style.objectFit = 'contain';
            }
        }
        // Carrusel principal
        document.querySelectorAll('.carousel-item img').forEach(function(img) {
            img.addEventListener('load', function() {
                setObjectFit(img);
            });
            if (img.complete) {
                setObjectFit(img);
            }
        });
        // Thumbnails
        document.querySelectorAll('.thumbnail-item img').forEach(function(img) {
            img.addEventListener('load', function() {
                setObjectFit(img);
            });
            if (img.complete) {
                setObjectFit(img);
            }
        });
        // Imagen única (cuando solo hay una)
        document.querySelectorAll('.main-carousel img').forEach(function(img) {
            img.addEventListener('load', function() {
                setObjectFit(img);
            });
            if (img.complete) {
                setObjectFit(img);
            }
        });
    });