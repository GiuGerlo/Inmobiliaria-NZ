import Link from 'next/link';
import { Home, Building2, Store, Trees, Car, MapPinned, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import type { PropertyType } from '@/lib/types';

function iconFor(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes('casa')) return Home;
  if (n.includes('depto') || n.includes('depart')) return Building2;
  if (n.includes('local')) return Store;
  if (n.includes('quinta')) return Trees;
  if (n.includes('cochera')) return Car;
  if (n.includes('terreno')) return MapPinned;
  return Building2;
}

export function Categories({ types }: { types: PropertyType[] }) {
  return (
    <section id="propiedades" className="bg-navy py-24 text-cream lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Nuestra cartera
            </span>
            <h2 className="mt-4 font-display text-4xl lg:text-5xl">Explorá por categoría</h2>
            <p className="mt-5 text-cream/70">
              Una amplia variedad de opciones para encontrar exactamente lo que buscás.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {types.map((t, i) => {
            const Icon = iconFor(t.name);
            return (
              <Reveal key={t.id} delay={i * 0.06} as="div">
                <Link
                  href={`/propiedades?type=${t.id}`}
                  className="group flex h-full flex-col items-start gap-5 rounded-card border border-cream/10 bg-cream/[0.03] p-6 transition-all duration-400 hover:border-gold/40 hover:bg-cream/[0.06]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <span className="font-display text-lg leading-tight">{t.name}</span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 text-center">
            <Link
              href="/propiedades"
              className="inline-flex rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy transition-transform hover:scale-[1.03]"
            >
              Ver todas las propiedades
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
