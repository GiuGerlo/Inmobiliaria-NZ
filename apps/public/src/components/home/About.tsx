import Link from 'next/link';
import { UserCheck, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const values = [
  {
    icon: UserCheck,
    title: 'Enfoque personalizado',
    text: 'Cada cliente y cada propiedad tienen su historia. Acompañamos todo el proceso de cerca.',
  },
  {
    icon: ShieldCheck,
    title: 'Experiencia comprobada',
    text: 'Respaldo jurídico y matrícula de corredora inmobiliaria para operar con total seguridad.',
  },
  {
    icon: Heart,
    title: 'Compromiso social',
    text: 'Una mirada humana del negocio inmobiliario, con valores y cercanía a la comunidad.',
  },
];

export function About() {
  return (
    <section id="nosotros" className="bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="overflow-hidden rounded-card shadow-lift">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/logo-nadina.jpg"
                  alt="Nadina Zaranich"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden max-w-xs rounded-card border-l-2 border-gold bg-navy p-6 text-cream shadow-lift sm:block">
                <p className="font-display text-lg italic leading-snug">
                  «Las oportunidades no ocurren, las creas.»
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Sobre nosotros
              </span>
              <h2 className="mt-4 font-display text-4xl text-ink lg:text-5xl">
                Conocé nuestra historia
              </h2>
              <p className="mt-6 leading-relaxed text-muted">
                El Estudio Jurídico-Inmobiliario nació en 2020, en plena pandemia, de la mano de{' '}
                <strong className="text-ink">Nadina Zaranich</strong> — abogada (2002) y corredora
                inmobiliaria y martillera pública. Una combinación poco común que nos permite
                acompañar cada operación con respaldo legal y mirada inmobiliaria a la vez.
              </p>
            </Reveal>

            <div className="mt-10 space-y-6">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.1} as="div">
                  <div className="flex gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy/5 text-navy">
                      <v.icon size={22} strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg text-ink">{v.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{v.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <Link
                href="/propiedades"
                className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold"
              >
                Comenzá tu próximo proyecto inmobiliario
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
