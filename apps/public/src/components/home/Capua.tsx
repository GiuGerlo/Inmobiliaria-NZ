import {
  ExternalLink,
  MapPin,
  Waves,
  Car,
  Trees,
  Sun,
  WashingMachine,
  Package,
  Bike,
  Flame,
  Dumbbell,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { ImageCarousel, type CarouselImage } from '@/components/ImageCarousel';
import { site } from '@/lib/site';

const slides: CarouselImage[] = [
  'slide-01.jpg',
  'slide-02.jpg',
  'slide-03.jpg',
  'slide-04.jpg',
  'slide-05.jpg',
  'slide-06.webp',
  'slide-07.webp',
  'slide-08.webp',
].map((f) => ({ src: `/img/capua/${f}`, alt: 'Capua de Edilizia' }));

const interior: CarouselImage[] = [
  'complejo-01.webp',
  'complejo-02.webp',
  'complejo-03.webp',
  'complejo-04.webp',
  'complejo05.webp',
].map((f) => ({ src: `/img/capua/${f}`, alt: 'Interior del complejo Capua' }));

const chips = ['Oficinas', 'Cocheras', 'Residencias 1, 2 y 3 dorm.', 'Funes, Santa Fe'];

const amenities: { label: string; icon: LucideIcon }[] = [
  { label: 'Piscina', icon: Waves },
  { label: 'Cocheras', icon: Car },
  { label: 'Áreas verdes', icon: Trees },
  { label: 'Solárium', icon: Sun },
  { label: 'Laundry', icon: WashingMachine },
  { label: 'Bauleras', icon: Package },
  { label: 'Bicicleteros', icon: Bike },
  { label: 'Quincho', icon: Flame },
  { label: 'Gimnasio', icon: Dumbbell },
  { label: 'Juegos', icon: Gamepad2 },
];

export function Capua() {
  return (
    <section id="capua" className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-gold/10 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Proyecto destacado en cartera
            </span>
            <h2 className="mt-4 font-display text-5xl leading-none text-ink lg:text-6xl">
              CAPUA <span className="italic text-gold">de Edilizia</span>
            </h2>
            <p className="mt-3 font-display text-xl text-muted">Un estilo de vida diferente</p>
            <p className="mt-6 max-w-md leading-relaxed text-muted">
              Complejo residencial-comercial en Funes que combina paseo comercial, oficinas y
              residencias en un mismo lugar.
            </p>

            <ul className="mt-7 flex flex-wrap gap-2.5">
              {chips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-navy/15 bg-white px-4 py-1.5 text-sm text-navy"
                >
                  {c}
                </li>
              ))}
            </ul>

            <a
              href={site.capuaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.03]"
            >
              Conocer el proyecto
              <ExternalLink size={16} className="text-gold" />
            </a>
          </Reveal>

          <Reveal delay={0.15}>
            <ImageCarousel images={slides} aspect="aspect-[4/3]" />
          </Reveal>
        </div>

        {/* Amenities */}
        <Reveal>
          <div className="mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  Equipamiento
                </span>
                <h3 className="mt-3 font-display text-3xl text-ink">Amenities</h3>
              </div>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {amenities.map((a) => (
                <li
                  key={a.label}
                  className="flex items-center gap-3 rounded-card border border-navy/10 bg-white px-5 py-4 text-sm font-medium text-navy shadow-soft transition-colors hover:border-gold/40"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                    <a.icon size={18} strokeWidth={1.5} />
                  </span>
                  {a.label}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* El complejo por dentro */}
        <div className="mt-24 grid items-center gap-12 lg:grid-cols-2">
          <Reveal delay={0.1}>
            <ImageCarousel images={interior} aspect="aspect-[4/3]" />
          </Reveal>
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              El complejo por dentro
            </span>
            <h3 className="mt-3 font-display text-4xl text-ink">Conocé Capua de Edilizia</h3>
            <p className="mt-5 leading-relaxed text-muted">
              Vistas exteriores e interiores del complejo. Capua de Edilizia está emplazado en{' '}
              <strong className="text-ink">Funes, Santa Fe</strong>, una de las zonas de mayor
              proyección del área metropolitana de Rosario: excelente conectividad, entorno
              residencial consolidado y servicios cercanos.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy">
              <MapPin size={16} className="text-gold" /> Funes, Santa Fe
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
