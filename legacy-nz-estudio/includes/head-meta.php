<?php
// Definir variables SEO por defecto
$site_name = "Estudio Jurídico-Inmobiliario Nadina Zaranich";
$site_description = "Encontrá la propiedad ideal para vos en Guatimozín y alrededores. Casas, terrenos, locales comerciales y más. Asesoramiento jurídico e inmobiliario profesional.";
$site_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
$current_url = $site_url . $_SERVER['REQUEST_URI'];

// Imagen OpenGraph y Twitter Card (siempre absoluta y sin punto al inicio)
$og_image = $site_url . '/assets/img/opengraph.jpg';

// SEO dinámico por página
$title = isset($page_title) ? "$page_title - $site_name" : $site_name;
$description = isset($page_description) ? $page_description : $site_description;

// Cargar configuración
require_once __DIR__ . '/../config/config.php';
?>

<!-- SEO Básico -->
<title><?= htmlspecialchars($title) ?></title>
<meta name="description" content="<?= htmlspecialchars($description) ?>">

<!-- Google Analytics 4 -->
<?php if(defined('GOOGLE_ANALYTICS_ID') && GOOGLE_ANALYTICS_ID): ?>
<script async src="https://www.googletagmanager.com/gtag/js?id=<?= GOOGLE_ANALYTICS_ID ?>"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '<?= GOOGLE_ANALYTICS_ID ?>');
</script>
<?php endif; ?>

<meta name="keywords" content="inmobiliaria guatimozin, propiedades cordoba, casas en venta, terrenos, locales comerciales, asesoramiento juridico inmobiliario">
<link rel="canonical" href="<?= $current_url ?>">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="<?= $current_url ?>">
<meta property="og:title" content="<?= htmlspecialchars($title) ?>">
<meta property="og:description" content="<?= htmlspecialchars($description) ?>">
<meta property="og:image" content="<?= $og_image ?>">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Estudio Jurídico-Inmobiliario Nadina Zaranich">
<meta property="og:site_name" content="<?= $site_name ?>">
<meta property="og:locale" content="es_AR">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="<?= $current_url ?>">
<meta name="twitter:title" content="<?= htmlspecialchars($title) ?>">
<meta name="twitter:description" content="<?= htmlspecialchars($description) ?>">
<meta name="twitter:image" content="<?= $og_image ?>">
<meta name="twitter:image:alt" content="Estudio Jurídico-Inmobiliario Nadina Zaranich">

<!-- Metadatos adicionales -->
<meta name="author" content="Nadina Zaranich">
<meta name="robots" content="index, follow">
<meta name="geo.region" content="AR-X">
<meta name="geo.placename" content="Guatimozín">
<meta name="geo.position" content="-33.4645:-62.4376">
<meta name="ICBM" content="-33.4645, -62.4376">

<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="assets/img/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="assets/img/apple-touch-icon.png">

<!-- Rich Snippets / Schema.org -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "<?= $site_name ?>",
  "image": "<?= $og_image ?>",
  "description": "<?= $site_description ?>",
  "url": "<?= $site_url ?>",
  "telephone": "+54-3468-525227",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Catamarca 227",
    "addressLocality": "Guatimozín",
    "addressRegion": "Córdoba",
    "postalCode": "2627",
    "addressCountry": "AR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -33.4620,
    "longitude": -62.4382
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.instagram.com/nadinazaranich_estudio"
  ]
}
</script>
