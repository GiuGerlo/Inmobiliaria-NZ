<?php
// ─────────────────────────────────────────────────────────────────────
// Sección publicitaria: CAPUA de Edilizia (proyecto destacado en cartera)
// Imágenes esperadas en assets/img/capua/:
//   - slide-01.jpg, slide-02.jpg, ...  → carrusel principal (con lightbox)
//   - transition-01.jpg, -02.jpg, -03.jpg → bloque crossfade tipo video
// ─────────────────────────────────────────────────────────────────────
$capua_dir   = __DIR__ . '/../assets/img/capua/';
$capua_url   = 'assets/img/capua/';
$capua_slides      = [];   // slide-*    → carrusel principal (propiedades y oficinas)
$capua_transitions = [];   // transition-* → crossfade acumulativo
$capua_complejo    = [];   // complejo*  → galería del complejo
$capua_ubicacion   = null; // ubicacion* → imagen única de localización

if (is_dir($capua_dir)) {
    foreach (glob($capua_dir . '*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', GLOB_BRACE) as $file) {
        $name = basename($file);
        if (stripos($name, 'transition') === 0 || stripos($name, 'transicion') === 0) {
            $capua_transitions[] = $capua_url . $name;
        } elseif (stripos($name, 'complejo') === 0) {
            $capua_complejo[] = $capua_url . $name;
        } elseif (stripos($name, 'ubicacion') === 0 || stripos($name, 'ubicación') === 0) {
            $capua_ubicacion = $capua_url . $name;
        } else {
            $capua_slides[] = $capua_url . $name;
        }
    }
    sort($capua_slides);
    sort($capua_transitions);
    sort($capua_complejo);
}
$has_slides       = !empty($capua_slides);
$has_transitions  = !empty($capua_transitions);
$has_complejo     = !empty($capua_complejo);
$has_ubicacion    = !empty($capua_ubicacion);
$multi            = count($capua_slides) > 1;

// Link a Google Maps (búsqueda; user puede reemplazar por coords específicas)
$capua_maps_url = 'https://www.google.com/maps/search/?api=1&query=Capua+Funes+Edilizia';

// Amenities oficiales del proyecto (orden y nombre según sitio capuafunes.com.ar)
$capua_amenities = [
    ['icon' => 'bi-water',              'label' => 'Piscina'],
    ['icon' => 'bi-car-front',          'label' => 'Cocheras'],
    ['icon' => 'bi-tree',               'label' => 'Áreas verdes'],
    ['icon' => 'bi-brightness-high',    'label' => 'Solarium'],
    ['icon' => 'bi-droplet',            'label' => 'Laundry'],
    ['icon' => 'bi-box-seam',           'label' => 'Bauleras'],
    ['icon' => 'bi-bicycle',            'label' => 'Bicicleteros'],
    ['icon' => 'bi-fire',               'label' => 'Quincho'],
    ['icon' => 'bi-trophy',             'label' => 'Gimnasio'],
    ['icon' => 'bi-controller',         'label' => 'Juegos'],
];
?>
<section id="capua" class="capua section py-5">
  <div class="container">

    <!-- ─── Bloque 1: Carrusel + texto principal ─────────────────────── -->
    <div class="row align-items-center g-4 g-lg-5" data-aos="fade-up">

      <div class="col-lg-7" data-aos="fade-right" data-aos-delay="100">
        <div id="capuaCarousel"
             class="carousel slide capua-carousel"
             <?= $multi ? 'data-bs-ride="carousel" data-bs-interval="5000"' : '' ?>>

          <?php if ($multi): ?>
            <div class="carousel-indicators">
              <?php foreach ($capua_slides as $i => $_): ?>
                <button type="button"
                        data-bs-target="#capuaCarousel"
                        data-bs-slide-to="<?= $i ?>"
                        class="<?= $i === 0 ? 'active' : '' ?>"
                        aria-label="Slide <?= $i + 1 ?>"
                        <?= $i === 0 ? 'aria-current="true"' : '' ?>></button>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>

          <div class="carousel-inner rounded-3 overflow-hidden">
            <?php if (!$has_slides): ?>
              <div class="carousel-item active capua-placeholder">
                <div class="d-flex flex-column align-items-center justify-content-center text-center p-4 h-100">
                  <i class="bi bi-images" style="font-size:3rem;opacity:.4;"></i>
                  <p class="mt-3 mb-0">
                    Subí las imágenes del proyecto en<br>
                    <code>assets/img/capua/</code>
                  </p>
                </div>
              </div>
            <?php else: foreach ($capua_slides as $i => $src): ?>
              <div class="carousel-item <?= $i === 0 ? 'active' : '' ?>">
                <a href="<?= htmlspecialchars($src) ?>"
                   class="glightbox capua-slide-link"
                   data-gallery="capua-slides"
                   data-description="Capua de Edilizia — vista <?= $i + 1 ?>">
                  <img src="<?= htmlspecialchars($src) ?>"
                       class="d-block w-100 capua-slide-img"
                       alt="Capua de Edilizia — vista <?= $i + 1 ?>"
                       loading="lazy">
                  <span class="capua-zoom-hint"><i class="bi bi-zoom-in"></i></span>
                </a>
              </div>
            <?php endforeach; endif; ?>
          </div>

          <?php if ($multi): ?>
            <button class="carousel-control-prev" type="button"
                    data-bs-target="#capuaCarousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button"
                    data-bs-target="#capuaCarousel" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Siguiente</span>
            </button>
          <?php endif; ?>
        </div>
      </div>

      <div class="col-lg-5" data-aos="fade-left" data-aos-delay="200">
        <span class="capua-eyebrow">Proyecto destacado en cartera</span>
        <h2 class="capua-title">CAPUA <span>de Edilizia</span></h2>
        <p class="capua-tagline">"Un estilo de vida diferente"</p>
        <p class="capua-desc">
          Complejo residencial-comercial en Funes que combina paseo comercial,
          oficinas y residencias en un mismo lugar.
        </p>

        <ul class="capua-chips list-unstyled">
          <li><i class="bi bi-building"></i> Oficinas</li>
          <li><i class="bi bi-car-front"></i> Cocheras</li>
          <li><i class="bi bi-house-door"></i> Residencias 1, 2 y 3 dorm.</li>
          <li><i class="bi bi-geo-alt"></i> Funes, Santa Fe</li>
        </ul>

        <a href="https://capuafunes.com.ar/"
           target="_blank" rel="noopener"
           class="btn btn-capua">
          Conocé el proyecto
          <i class="bi bi-arrow-up-right ms-1"></i>
        </a>
      </div>
    </div>

    <?php if ($has_transitions): ?>
    <!-- ─── Bloque 2: Crossfade acumulativo (distribución residencias) ─ -->
    <div class="capua-divider"></div>
    <div class="row align-items-center g-4 g-lg-5" data-aos="fade-up">
      <div class="col-lg-5 order-lg-1" data-aos="fade-right" data-aos-delay="100">
        <span class="capua-eyebrow">Distribución</span>
        <h3 class="capua-subtitle">Ubicación de las residencias en el complejo</h3>
        <p class="capua-desc">
          Mirá cómo se distribuyen las residencias dentro del complejo —
          las capas se van superponiendo para mostrar cada nivel del proyecto.
        </p>
      </div>
      <div class="col-lg-7 order-lg-2" data-aos="fade-left" data-aos-delay="200">
        <div class="capua-crossfade">
          <?php foreach ($capua_transitions as $i => $src): ?>
            <img src="<?= htmlspecialchars($src) ?>"
                 alt="Capua complejo — capa <?= $i + 1 ?>"
                 class="capua-crossfade-img capua-crossfade-img--<?= $i + 1 ?>"
                 loading="lazy">
          <?php endforeach; ?>
        </div>
      </div>
    </div>
    <?php endif; ?>

    <?php if ($has_complejo): ?>
    <!-- ─── Bloque 3: Galería del complejo ─────────────────────────── -->
    <div class="capua-divider"></div>
    <div class="row" data-aos="fade-up">
      <div class="col-12 text-center mb-4">
        <span class="capua-eyebrow">El complejo por dentro</span>
        <h3 class="capua-subtitle">Conocé Capua de Edilizia</h3>
        <p class="capua-desc mx-auto" style="max-width:640px;">
          Vistas exteriores e interiores del complejo. Click en cualquier imagen para ampliar.
        </p>
      </div>
      <div class="col-12">
        <div class="capua-gallery">
          <?php foreach ($capua_complejo as $i => $src): ?>
            <a href="<?= htmlspecialchars($src) ?>"
               class="glightbox capua-gallery-item"
               data-gallery="capua-complejo"
               data-description="Capua de Edilizia — vista <?= $i + 1 ?>"
               data-aos="zoom-in"
               data-aos-delay="<?= 80 + ($i * 60) ?>">
              <img src="<?= htmlspecialchars($src) ?>"
                   alt="Capua complejo — vista <?= $i + 1 ?>"
                   loading="lazy">
              <span class="capua-zoom-hint"><i class="bi bi-zoom-in"></i></span>
            </a>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
    <?php endif; ?>

    <!-- ─── Bloque 4: Amenities ────────────────────────────────────── -->
    <div class="capua-divider"></div>
    <div class="row" data-aos="fade-up">
      <div class="col-12 text-center mb-4">
        <span class="capua-eyebrow">Equipamiento</span>
        <h3 class="capua-subtitle">Amenities</h3>
      </div>
      <div class="col-12">
        <ul class="capua-amenities list-unstyled">
          <?php foreach ($capua_amenities as $i => $a): ?>
            <li data-aos="zoom-in" data-aos-delay="<?= 50 + ($i * 40) ?>">
              <i class="bi <?= htmlspecialchars($a['icon']) ?>"></i>
              <span><?= htmlspecialchars($a['label']) ?></span>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>

    <?php if ($has_ubicacion): ?>
    <!-- ─── Bloque 5: Ubicación en Funes (con link a Google Maps) ──── -->
    <div class="capua-divider"></div>
    <div class="row align-items-center g-4 g-lg-5" data-aos="fade-up">
      <div class="col-lg-7" data-aos="fade-right" data-aos-delay="100">
        <a href="<?= htmlspecialchars($capua_ubicacion) ?>"
           class="glightbox capua-ubicacion-link"
           data-gallery="capua-ubicacion"
           data-description="Ubicación de Capua de Edilizia en Funes">
          <img src="<?= htmlspecialchars($capua_ubicacion) ?>"
               alt="Ubicación de Capua de Edilizia en Funes"
               class="capua-ubicacion-img"
               loading="lazy">
          <span class="capua-zoom-hint"><i class="bi bi-zoom-in"></i></span>
        </a>
      </div>
      <div class="col-lg-5" data-aos="fade-left" data-aos-delay="200">
        <span class="capua-eyebrow">¿Dónde queda?</span>
        <h3 class="capua-subtitle">Ubicación en Funes</h3>
        <p class="capua-desc">
          Capua de Edilizia está emplazado en <strong>Funes, Santa Fe</strong>,
          una de las zonas de mayor proyección del área metropolitana de Rosario.
          Excelente conectividad, entorno residencial consolidado y servicios cercanos.
        </p>
        <a href="<?= htmlspecialchars($capua_maps_url) ?>"
           target="_blank" rel="noopener"
           class="btn btn-capua-outline">
          <i class="bi bi-geo-alt-fill me-1"></i>
          Ver en Google Maps
        </a>
      </div>
    </div>
    <?php endif; ?>

  </div>
</section>
