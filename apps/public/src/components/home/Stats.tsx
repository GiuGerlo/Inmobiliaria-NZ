import { Reveal } from '@/components/Reveal';
import { Counter } from '@/components/Counter';

export interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

/** Franja de credibilidad con contadores animados. */
export function Stats({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-navy py-16 text-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 lg:grid-cols-4 lg:px-8">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1} className="text-center">
            <p className="font-display text-5xl text-gold lg:text-6xl">
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.15em] text-cream/60">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
