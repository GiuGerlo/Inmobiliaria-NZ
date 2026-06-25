import { Reveal } from '@/components/Reveal';
import { AnimatedText } from '@/components/AnimatedText';

/** Cabecera navy reutilizable para páginas interiores (catálogo, vendidas). */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy pb-16 pt-36 text-cream">
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-gold/15 blur-[110px]" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            {eyebrow}
          </span>
          <AnimatedText
            as="h1"
            text={title}
            trigger="load"
            delay={0.1}
            className="mt-4 font-display text-5xl leading-none lg:text-6xl"
          />
          {subtitle && <p className="mt-5 max-w-xl text-cream/70">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}
