import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Tag, Camera, Maximize, Check, ImageIcon, CheckCircle2, type LucideIcon } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { ImageCarousel } from '@/components/ImageCarousel';
import { MapEmbed } from '@/components/MapEmbed';
import { PropertyCard } from '@/components/PropertyCard';
import { getCatalog, findBySlug } from '@/lib/api';
import { coverImage, splitList, type SaleProperty } from '@/lib/types';
import { site, whatsappLink, jsonLdString } from '@/lib/site';

export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await getCatalog();
  return all.map((p) => ({ slug: p.slug }));
}

function buildDescription(p: SaleProperty): string {
  const parts = [
    p.locality ? `Propiedad en ${p.locality}.` : null,
    p.size ?? null,
    p.location ? `Ubicada en ${p.location}.` : null,
  ].filter(Boolean);
  return parts.join(' ') || site.description;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await findBySlug(slug);
  if (!property) return { title: 'Propiedad no encontrada' };

  const title = property.title ?? 'Propiedad';
  const description = buildDescription(property);
  const image = coverImage(property);

  const ogImages = image
    ? [{ url: image, width: 1200, height: 800, alt: title }]
    : [{ url: '/img/opengraph.jpg', width: 1200, height: 630, alt: site.name }];

  return {
    title,
    description,
    alternates: { canonical: `/propiedades/${slug}` },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: site.locale,
      title,
      description,
      url: `/propiedades/${slug}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

function productJsonLd(p: SaleProperty) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title ?? 'Propiedad',
    description: buildDescription(p),
    image: p.images.map((i) => i.url),
    category: p.type?.name,
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      availability: p.is_sold
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      seller: { '@type': 'RealEstateAgent', name: site.name },
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await findBySlug(slug);
  if (!property) notFound();

  const all = await getCatalog();
  const similar = all
    .filter(
      (p) =>
        p.id !== property.id &&
        !p.is_sold &&
        p.property_type_id === property.property_type_id,
    )
    .slice(0, 3);

  const services = splitList(property.services);
  const features = splitList(property.features);
  const cover = coverImage(property);
  const title = property.title ?? 'Propiedad';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(productJsonLd(property)) }}
      />
      <Navbar />

      <main className="bg-cream">
        {/* ── Hero foto-background ── */}
        <section className="relative min-h-[60vh] overflow-hidden bg-navy lg:min-h-[68vh]">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {/* overlay liviano arriba, pesado abajo — la pill nav queda visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy/45 via-navy/55 to-navy/92" />
          <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-gold/15 blur-[110px]" />

          <div className="relative mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-end px-5 pb-12 pt-36 lg:min-h-[68vh] lg:px-8 lg:pb-16">
            <Link
              href="/propiedades"
              className="w-fit text-sm text-cream/60 transition-colors hover:text-gold"
            >
              ← Volver a propiedades
            </Link>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <h1 className="max-w-2xl font-display text-4xl leading-tight text-cream lg:text-5xl">
                {title}
              </h1>
              <span
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                  property.is_sold
                    ? 'bg-gold text-navy'
                    : 'border border-cream/30 text-cream'
                }`}
              >
                {property.is_sold ? 'Vendida' : 'Disponible'}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-sm text-cream/70">
              {property.locality && (
                <span className="flex items-center gap-2">
                  <MapPin size={15} className="text-gold" /> {property.locality}
                </span>
              )}
              {property.type && (
                <span className="flex items-center gap-2">
                  <Tag size={15} className="text-gold" /> {property.type.name}
                </span>
              )}
              {property.size && (
                <span className="flex items-center gap-2">
                  <Maximize size={15} className="text-gold" /> {property.size}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Camera size={15} className="text-gold" /> {property.images.length} fotos
              </span>
            </div>
          </div>
        </section>

        {/* ── Contenido principal ── */}
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
          {/* Columna principal */}
          <div className="space-y-12">
            {/* Galería */}
            {property.images.length > 0 ? (
              <ImageCarousel
                images={property.images.map((img) => ({ src: img.url, alt: title }))}
                aspect="aspect-[16/10]"
                thumbnails
              />
            ) : cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={title}
                className="aspect-[16/10] w-full rounded-card object-cover"
              />
            ) : (
              <div className="grid aspect-[16/10] w-full place-items-center rounded-card bg-navy/5 text-navy/20">
                <ImageIcon size={56} />
              </div>
            )}

            {/* Información general — cards con iconos */}
            <div>
              <SectionHeading>Información general</SectionHeading>
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <InfoCard icon={MapPin} label="Ubicación" value={property.location} />
                <InfoCard icon={Maximize} label="Dimensiones" value={property.size} />
                <InfoCard icon={Tag} label="Categoría" value={property.type?.name} />
                <InfoCard
                  icon={CheckCircle2}
                  label="Estado"
                  value={property.is_sold ? 'Vendida' : 'Disponible'}
                  highlight={!property.is_sold}
                />
              </dl>
            </div>

            {/* Servicios */}
            {services.length > 0 && (
              <div>
                <SectionHeading>Servicios</SectionHeading>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {services.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/8 px-4 py-1.5 text-sm font-medium text-navy"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Características */}
            {features.length > 0 && (
              <div>
                <SectionHeading>Características</SectionHeading>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 rounded-lg border border-navy/8 bg-white px-4 py-3 text-sm text-ink shadow-soft"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15">
                        <Check size={13} className="text-gold" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mapa */}
            {property.map_embed && (
              <div>
                <SectionHeading>Ubicación</SectionHeading>
                <div className="mt-5">
                  <MapEmbed value={property.map_embed} title={`Ubicación de ${title}`} />
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar de contacto — navy ── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card bg-navy p-7 shadow-lift">
              <h2 className="font-display text-xl text-cream">¿Te interesa?</h2>
              <p className="mt-2 text-sm text-cream/55">
                Contactanos para coordinar una visita o resolver tus dudas sobre esta propiedad.
              </p>

              <a
                href={whatsappLink(`Hola, me interesa la propiedad: ${title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block rounded-full bg-gold py-3.5 text-center text-sm font-semibold text-navy transition-transform hover:scale-[1.02]"
              >
                Consultar por WhatsApp
              </a>

              <dl className="mt-7 space-y-4 border-t border-cream/10 pt-6 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-cream/40">Teléfono</dt>
                  <dd className="mt-1 text-cream/80">{site.phone.display}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-cream/40">Email</dt>
                  <dd className="mt-1 break-all text-cream/80">{site.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-cream/40">Oficina</dt>
                  <dd className="mt-1 text-cream/80">
                    {site.address.street}, {site.address.city}, {site.address.region}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* ── Propiedades similares — cream ── */}
        {similar.length > 0 && (
          <section className="border-t border-navy/10 bg-cream py-20">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-3xl text-ink">Propiedades similares</h2>
                <Link
                  href="/propiedades"
                  className="text-sm font-medium text-navy/60 transition-colors hover:text-gold"
                >
                  Ver todas
                </Link>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <FloatingActions />
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-2xl text-ink">
      <span className="h-px w-6 rounded bg-gold" />
      {children}
    </h2>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white px-4 py-4 shadow-soft">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        <Icon size={14} className="text-gold" />
        {label}
      </dt>
      <dd className={`mt-2 text-sm font-semibold ${highlight ? 'text-gold' : 'text-ink'}`}>
        {value || '—'}
      </dd>
    </div>
  );
}
