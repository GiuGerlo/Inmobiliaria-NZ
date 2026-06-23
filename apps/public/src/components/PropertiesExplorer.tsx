'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SearchX } from 'lucide-react';
import { PropertyCard } from '@/components/PropertyCard';
import type { PropertyType, SaleProperty } from '@/lib/types';

function normalize(value: string): string {
  // Quita diacríticos (acentos) para que la búsqueda sea insensible a tildes.
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

  // Solo mostramos categorías que tienen propiedades.
  const usableTypes = types.filter((t) => properties.some((p) => p.property_type_id === t.id));

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Filtrá por categoría
          </p>
          <div className="relative w-full sm:max-w-xs">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título o localidad…"
              className="w-full rounded-full border border-navy/15 bg-white py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors focus:border-gold"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
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

      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="mt-16 grid place-items-center text-center text-muted">
          <SearchX size={40} className="text-navy/20" />
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
      className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-navy text-cream'
          : 'border border-navy/15 bg-white text-navy hover:border-gold hover:text-gold'
      }`}
    >
      {children}
    </button>
  );
}
