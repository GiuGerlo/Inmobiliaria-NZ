<!-- Services Section -->
<section id="servicios" class="services section py-5">
    <div class="container" data-aos="fade-up">
        <!-- Encabezado -->
        <div class="row mb-0">
            <div class="col-12 text-center mb-2">
                <!-- <span class="section-badge">EXPLORA</span> -->
                <h2 class="section-title mt-2">Nuestras Propiedades</h2>
            </div>
        </div>

        <!-- Botonera de Servicios -->
        <div class="row g-4 justify-content-center">
            <!-- Alquileres -->
            <div class="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="fade-up" data-aos-delay="100">
                <a href="#" class="service-btn" id="alquileres-btn">
                    <div class="service-btn-inner">
                        <i class="bi bi-house-door"></i>
                        <span>Alquileres</span>
                    </div>
                </a>
            </div>

            <!-- Casas -->
            <div class="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="fade-up" data-aos-delay="150">
                <a href="propiedades.php#cat-1" class="service-btn">
                    <div class="service-btn-inner">
                        <i class="bi bi-house"></i>
                        <span>Casas</span>
                    </div>
                </a>
            </div>

            <!-- Cocheras -->
            <div class="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="fade-up" data-aos-delay="175">
                <a href="propiedades.php#cat-5" class="service-btn">
                    <div class="service-btn-inner">
                        <i class="bi bi-car-front"></i>
                        <span>Cocheras</span>
                    </div>
                </a>
            </div>

            <!-- Departamentos -->
            <div class="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="fade-up" data-aos-delay="200">
                <a href="propiedades.php#cat-6" class="service-btn">
                    <div class="service-btn-inner">
                        <i class="bi bi-building"></i>
                        <span>Departamentos</span>
                    </div>
                </a>
            </div>

            <!-- Locales -->
            <div class="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="fade-up" data-aos-delay="250">
                <a href="propiedades.php#cat-3" class="service-btn">
                    <div class="service-btn-inner">
                        <i class="bi bi-shop"></i>
                        <span>Locales</span>
                    </div>
                </a>
            </div>

            <!-- Quintas -->
            <div class="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="fade-up" data-aos-delay="300">
                <a href="propiedades.php#cat-4" class="service-btn">
                    <div class="service-btn-inner">
                        <i class="bi bi-flower1"></i>
                        <span>Quintas</span>
                    </div>
                </a>
            </div>

            <!-- Terrenos -->
            <div class="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="fade-up" data-aos-delay="350">
                <a href="propiedades.php#cat-2" class="service-btn">
                    <div class="service-btn-inner">
                        <i class="bi bi-tree"></i>
                        <span>Terrenos</span>
                    </div>
                </a>
            </div>
        </div>
    </div>
</section>
<!-- /Services Section -->

<script>
document.addEventListener('DOMContentLoaded', function() {
    var alquilerBtn = document.getElementById('alquileres-btn');
    if (alquilerBtn) {
        alquilerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Swal.fire({
                icon: 'info',
                title: '¡Próximamente!',
                text: 'Todavía no están disponibles los alquileres.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        });
    }
});
</script>