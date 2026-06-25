/**
 * Datos fijos del Estudio Jurídico-Inmobiliario Nadina Zaranich.
 * Fuente: sitio legacy (legacy-nz-estudio/includes/footer.php + head-meta.php).
 */
export const site = {
  name: 'Estudio Jurídico-Inmobiliario Nadina Zaranich',
  shortName: 'NZ Estudio',
  description:
    'Servicios inmobiliarios y asesoramiento jurídico en Guatimozín y zona. Compra, venta y asesoramiento profesional y personalizado.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'es_AR',
  phone: {
    display: '3468 52-5227',
    e164: '+543468525227',
    whatsapp: '5493468525227',
  },
  email: 'nadinazaranich@gmail.com',
  address: {
    street: 'Catamarca 227',
    city: 'Guatimozín',
    region: 'Córdoba',
    country: 'AR',
    postalCode: '2627',
  },
  geo: { lat: -33.462, lng: -62.4382 },
  hours: 'Lunes a Viernes · 8:00–12:00 y 16:00–19:00',
  social: {
    instagram: 'https://www.instagram.com/nadinazaranich_estudio',
  },
  capuaUrl: 'https://capuafunes.com.ar/',
  developer: { name: 'Giuliano Gerlo', url: 'https://giulianogerlo.vercel.app/' },
} as const;

/**
 * Serializa un objeto para inyectarlo en <script type="application/ld+json">.
 * Escapa `<` para que un valor con `</script>` no pueda romper el bloque (XSS).
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** wa.me con texto opcional prellenado. */
export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${site.phone.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** JSON-LD del negocio (RealEstateAgent) — se inyecta global en el layout. */
export function businessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email,
    image: `${site.url}/img/opengraph.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '12:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '16:00',
        closes: '19:00',
      },
    ],
    sameAs: [site.social.instagram],
  };
}
