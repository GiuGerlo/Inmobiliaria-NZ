'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, Building2, HeartHandshake, Award, ArrowRight } from 'lucide-react';
import { HeroHouse } from './HeroHouse';

const MotionLink = motion.create(Link);

const features = [
  { icon: Scale, label: 'Asesoramiento legal' },
  { icon: Building2, label: 'Amplia cartera' },
  { icon: HeartHandshake, label: 'Atención personalizada' },
  { icon: Award, label: '+5 años de experiencia' },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-navy text-cream">
      {/* Atmósfera: imagen + degradados + halo dorado */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/hero.png" alt="" className="h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/60" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-gold/15 blur-[120px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-8"
      >
        <div>
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold"
          >
            Tu sueño inmobiliario comienza aquí
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-7 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            Encontrá la propiedad{' '}
            <span className="relative italic text-gold">
              perfecta
              <motion.span
                className="absolute -bottom-2 left-0 h-0.5 w-full origin-left hairline-gold"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>{' '}
            para vos
          </motion.h1>

          <motion.p variants={item} className="mt-7 max-w-xl text-lg leading-relaxed text-cream/75">
            Te ayudamos a hacer realidad tus sueños inmobiliarios con asesoramiento jurídico
            profesional y una atención verdaderamente personalizada.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
            <MotionLink
              href="/propiedades"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy"
            >
              Ver propiedades
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </MotionLink>
            <MotionLink
              href="/#contacto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
            >
              Contactar
            </MotionLink>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-16 grid max-w-3xl grid-cols-2 gap-6 border-t border-cream/10 pt-10 pb-20 sm:grid-cols-4 lg:pb-0"
          >
            {features.map((f) => (
              <li key={f.label} className="flex flex-col gap-3">
                <f.icon size={26} className="text-gold" strokeWidth={1.5} />
                <span className="text-sm text-cream/70">{f.label}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Casa line-art decorativa — solo desktop (en mobile el hero respira sin ella). */}
        <motion.div variants={item} className="hidden lg:block">
          <HeroHouse />
        </motion.div>
      </motion.div>
    </section>
  );
}
