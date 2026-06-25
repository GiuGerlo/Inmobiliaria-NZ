'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Banner aditivo de las imágenes `transition-*` (recupera el efecto del legacy):
 * se muestra la 1, se funde la 2 ENCIMA, luego la 3 ENCIMA, y vuelve a la 1
 * (las superiores se desvanecen y reaparece la base), en bucle.
 * Reduced-motion → solo la primera, fija.
 */
export function CapuaCrossfade({ images }: { images: string[] }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const n = images.length;

  useEffect(() => {
    if (reduced || n < 2) return;
    const t = setInterval(() => setStep((p) => (p + 1) % n), 3500);
    return () => clearInterval(t);
  }, [reduced, n]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-navy shadow-lift sm:aspect-[16/9] lg:aspect-[16/10]">
      {images.map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt="Capua de Edilizia"
          initial={false}
          // Visible si su índice ya entró en el ciclo actual; las de índice
          // mayor a `step` quedan ocultas (al volver a 0 se desvanecen).
          animate={{ opacity: i <= step ? 1 : 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{ zIndex: i }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ))}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 z-10 p-6 lg:p-8">
        <p className="font-display text-2xl text-cream lg:text-3xl">
          CAPUA <span className="italic text-gold">de Edilizia</span>
        </p>
        <p className="mt-1 text-sm text-cream/70">Funes, Santa Fe · Un estilo de vida diferente</p>
      </div>
    </div>
  );
}
