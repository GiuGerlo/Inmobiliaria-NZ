import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Tag, Camera, Maximize, CheckCircle2, Check, ImageIcon } from 'lucide-react';
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

  return {
    title,
    description,
    alternates: { canonical: `/propiedades/${slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/propiedades/${slug}`,
      images: image ? [{ url: image }] : undefined,
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
        {/* Cabecera */}
        <section className="relative overflow-hidden bg-navy pb-12 pt-36 text-cream">
          <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-gold/15 blur-[110px]" />
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Link href="/propiedades" className="text-sm text-cream/60 transition-colors hover:text-gold">
              ← Volver a propiedades
            </Link>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <h1 className="max-w-2xl font-display text-4xl leading-tight lg:text-5xl">{title}</h1>
              <span
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                  property.is_sold ? 'bg-gold text-navy' : 'bg-cream/15 text-cream'
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
              <span className="flex items-center gap-2">
                <Camera size={15} className="text-gold" /> {property.images.length} fotos
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
          {/* Columna principal */}
          <div className="space-y-12">
            {property.images.length > 0 ? (
              <ImageCarousel
                images={property.images.map((img) => ({ src: img.url, alt: title }))}
                aspect="aspect-[16/10]"
                thumbnails
              />
            ) : cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={title} className="aspect-[16/10] w-full rounded-card object-cover" />
            ) : (
              <div className="grid aspect-[16/10] w-full place-items-center rounded-card bg-navy/5 text-navy/20">
                <ImageIcon size={56} />
              </div>
            )}

            {/* Información general */}
            <div>
              <h2 className="font-display text-2xl text-ink">Información general</h2>
              <dl className="mt-6 grid gap-px overflow-hidden rounded-card border border-navy/10 bg-navy/10 sm:grid-cols-2">
                <InfoRow icon={<MapPin size={16} />} label="Ubicación" value={property.location} />
                <InfoRow icon={<Maximize size={16} />} label="Dimensiones" value={property.size} />
                <InfoRow icon={<Tag size={16} />} label="Categoría" value={property.type?.name} />
                <InfoRow
                  icon={<CheckCircle2 size={16} />}
                  label="Estado"
                  value={property.is_sold ? 'Vendida' : 'Disponible'}
                />
              </dl>
            </div>

            {services.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-ink">Servicios</h2>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {services.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-navy/15 bg-white px-4 py-1.5 text-sm text-navy"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {features.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-ink">Características</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-ink">
                      <Check size={17} className="shrink-0 text-gold" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {property.map_embed && (
              <div>
                <h2 className="font-display text-2xl text-ink">Ubicación</h2>
                <div className="mt-5">
                  <MapEmbed value={property.map_embed} title={`Ubicación de ${title}`} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar de contacto */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-navy/10 bg-white p-7 shadow-soft">
              <h2 className="font-display text-xl text-ink">¿Te interesa?</h2>
              <p className="mt-2 text-sm text-muted">
                Contactanos para coordinar una visita o resolver tus dudas sobre esta propiedad.
              </p>
              <a
                href={whatsappLink(`Hola, me interesa la propiedad: ${title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block rounded-full bg-navy py-3.5 text-center text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
              >
                Consultar por WhatsApp
              </a>

              <dl className="mt-7 space-y-4 border-t border-navy/10 pt-6 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Teléfono</dt>
                  <dd className="mt-1 text-ink">{site.phone.display}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Email</dt>
                  <dd className="mt-1 break-all text-ink">{site.email}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Oficina</dt>
                  <dd className="mt-1 text-ink">
                    {site.address.street}, {site.address.city}, {site.address.region}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="border-t border-navy/10 bg-white py-20">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <h2 className="font-display text-3xl text-ink">Propiedades similares</h2>
              <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="bg-white px-5 py-4">
      <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
        <span className="text-gold">{icon}</span> {label}
      </dt>
      <dd className="mt-1.5 text-sm text-ink">{value || '—'}</dd>
    </div>
  );
}
