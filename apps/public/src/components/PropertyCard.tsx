import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { coverImage, type SaleProperty } from '@/lib/types';

export function PropertyCard({ property }: { property: SaleProperty }) {
  const cover = coverImage(property);
  const meta = [property.locality, property.size].filter(Boolean).join(' · ');

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-navy/8 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/25 hover:shadow-lift"
    >
      {/* ── Imagen 16/10 ── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-navy/5">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={property.title ?? 'Propiedad'}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-navy/20">
            <ImageIcon size={48} />
          </div>
        )}

        {/* gradiente dramático en la parte inferior */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        {/* badges abajo-izquierda */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {property.type && (
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
              {property.type.name}
            </span>
          )}
          {property.is_sold && (
            <span className="rounded-full bg-navy/80 px-3 py-1 text-xs font-semibold text-cream backdrop-blur-sm">
              Vendida
            </span>
          )}
        </div>
      </div>

      {/* ── Cuerpo — border-l gold aparece en hover ── */}
      <div className="flex flex-1 flex-col border-l-[3px] border-transparent p-5 transition-colors duration-300 group-hover:border-gold/50">
        <h3 className="font-display text-xl leading-tight text-ink">
          {property.title ?? 'Propiedad'}
        </h3>
        {meta && (
          <p className="mt-3 text-sm text-muted">{meta}</p>
        )}
      </div>

      {/* ── Footer strip ── */}
      <div className="border-t border-navy/8 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-navy/40 transition-colors duration-300 group-hover:text-gold">
        Ver propiedad
      </div>
    </Link>
  );
}
