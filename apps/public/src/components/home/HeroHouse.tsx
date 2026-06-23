'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * Casa line-art decorativa del hero. Trazos dorados que se "dibujan" al cargar
 * (pathLength), float lento e infinito y parallax sutil al scrollear.
 * ponytail: puramente decorativa → aria-hidden, sin texto ni semántica.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

// Cada path se dibuja con un pequeño retraso escalonado.
function drawVariant(delay: number, reduced: boolean) {
  return {
    hidden: { pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.4, delay, ease: EASE },
        opacity: { duration: 0.3, delay },
      },
    },
  };
}

export function HeroHouse() {
  const reduced = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  // Parallax: la casa sube unos px mientras se scrollea el hero.
  const y = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -60]);

  const stroke = {
    fill: 'none',
    stroke: 'var(--color-gold)',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  return (
    <motion.div
      aria-hidden
      style={{ y }}
      className="pointer-events-none relative mx-auto w-full max-w-md"
    >
      {/* Halo dorado detrás de la casa */}
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[90px]" />

      <motion.svg
        viewBox="0 0 400 360"
        className="relative w-full"
        initial="hidden"
        animate="visible"
        // Float lento del conjunto (se desactiva con reduced-motion).
        {...(reduced
          ? {}
          : {
              variants: {
                visible: { transition: { staggerChildren: 0.18 } },
              },
            })}
      >
        <motion.g
          animate={reduced ? undefined : { y: [0, -10, 0] }}
          transition={
            reduced ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* Suelo / horizonte */}
          <motion.path d="M60 300 H340" {...stroke} variants={drawVariant(0, reduced)} />

          {/* Cuerpo de la casa */}
          <motion.path
            d="M110 300 V170 H290 V300"
            {...stroke}
            variants={drawVariant(0.15, reduced)}
          />

          {/* Techo */}
          <motion.path
            d="M92 182 L200 96 L308 182"
            {...stroke}
            variants={drawVariant(0.3, reduced)}
          />

          {/* Chimenea */}
          <motion.path
            d="M250 132 V104 H272 V155"
            {...stroke}
            variants={drawVariant(0.45, reduced)}
          />

          {/* Puerta */}
          <motion.path
            d="M178 300 V232 H222 V300"
            {...stroke}
            variants={drawVariant(0.6, reduced)}
          />
          <motion.circle cx="213" cy="268" r="3" fill="var(--color-gold)" stroke="none" />

          {/* Ventana izquierda */}
          <motion.path
            d="M132 206 H160 V234 H132 Z"
            {...stroke}
            variants={drawVariant(0.7, reduced)}
          />
          <motion.path d="M146 206 V234 M132 220 H160" {...stroke} variants={drawVariant(0.8, reduced)} />

          {/* Ventana derecha */}
          <motion.path
            d="M240 206 H268 V234 H240 Z"
            {...stroke}
            variants={drawVariant(0.7, reduced)}
          />
          <motion.path d="M254 206 V234 M240 220 H268" {...stroke} variants={drawVariant(0.8, reduced)} />
        </motion.g>

        {/* Pin de ubicación flotante */}
        <motion.g
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={
            reduced ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }
          }
        >
          <motion.path
            d="M322 70 a20 20 0 1 0 -0.1 0 Z M322 50 a8 8 0 0 0 0 16 a8 8 0 0 0 0 -16 Z"
            fill="var(--color-gold)"
            stroke="none"
            variants={{
              hidden: { opacity: 0, scale: reduced ? 1 : 0 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { delay: reduced ? 0 : 1.2, duration: 0.5, ease: EASE },
              },
            }}
            style={{ transformOrigin: '322px 70px' }}
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}
