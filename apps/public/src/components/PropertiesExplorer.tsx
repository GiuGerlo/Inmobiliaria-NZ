'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SearchX } from 'lucide-react';
import { PropertyCard } from '@/components/PropertyCard';
import type { PropertyType, SaleProperty } from '@/lib/types';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function PropertiesExplorer({
  properties,
  types,
}: {
  properties: SaleProperty[];
  types: PropertyType[];
}) {
  const params = useSearchParams();
  const initialType = Number(params.get('type')) || null;

  const [activeType, setActiveType] = useState<number | null>(initialType);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return properties.filter((p) => {
      if (activeType && p.property_type_id !== activeType) return false;
      if (!q) return true;
      const haystack = normalize(
        [p.title, p.locality, p.location, p.type?.name].filter(Boolean).join(' '),
      );
      return haystack.includes(q);
    });
  }, [properties, activeType, query]);

  const usableTypes = types.filter((t) => properties.some((p) => p.property_type_id === t.id));

  return (
    <div>
      {/* ── Barra sticky: filtros + búsqueda ── */}
      <div className="sticky top-20 z-40 -mx-5 border-b border-navy/8 bg-cream/95 px-5 pb-5 pt-8 backdrop-blur-sm lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Filtrá por categoría
            </p>
            <span className="text-xs text-muted/60">
              {filtered.length} {filtered.length === 1 ? 'propiedad' : 'propiedades'}
            </span>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título o localidad…"
              className="w-full rounded-full border border-navy/15 bg-white py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip active={activeType === null} onClick={() => setActiveType(null)}>
            Todas
          </FilterChip>
          {usableTypes.map((t) => (
            <FilterChip key={t.id} active={activeType === t.id} onClick={() => setActiveType(t.id)}>
              {t.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* ── Grid de propiedades ── */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="mt-24 grid place-items-center text-center text-muted">
          <SearchX size={36} className="text-navy/20" />
          <p className="mt-4 font-display text-lg text-ink">No encontramos propiedades</p>
          <p className="mt-1 text-sm">Probá con otra categoría o término de búsqueda.</p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gold text-navy shadow-soft'
          : 'border border-navy/15 bg-white text-navy hover:border-gold hover:text-gold'
      }`}
    >
      {children}
    </button>
  );
}
