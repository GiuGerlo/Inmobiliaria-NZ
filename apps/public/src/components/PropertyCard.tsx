import Link from 'next/link';
import { MapPin, Maximize, ArrowUpRight, ImageIcon } from 'lucide-react';
import { coverImage, type SaleProperty } from '@/lib/types';

export function PropertyCard({ property }: { property: SaleProperty }) {
  const cover = coverImage(property);

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-card bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy/5">
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

        {/* Overlay de gradiente editorial: sutil siempre, intensifica en hover. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/55 via-navy/5 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

        {property.is_sold && (
          <span className="absolute left-4 top-4 rounded-full bg-navy px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold shadow-soft transition-transform duration-500 group-hover:-translate-y-0.5">
            Vendida
          </span>
        )}
        {property.type && (
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-navy shadow-soft backdrop-blur-sm transition-all duration-500 group-hover:bg-gold group-hover:text-navy">
            {property.type.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl leading-snug text-ink">
          {property.title ?? 'Propiedad'}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-muted">
          {property.locality && (
            <p className="flex items-center gap-2">
              <MapPin size={15} className="text-gold" />
              {property.locality}
            </p>
          )}
          {property.size && (
            <p className="flex items-center gap-2">
              <Maximize size={15} className="text-gold" />
              {property.size}
            </p>
          )}
        </div>

        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy transition-colors group-hover:text-gold">
          Ver más
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
