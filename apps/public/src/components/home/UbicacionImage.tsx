'use client';

import { useState } from 'react';
import { Expand } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const SRC = '/img/capua/ubicacion.webp';

export function UbicacionImage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ampliar mapa de ubicación"
        className="group relative w-full cursor-zoom-in overflow-hidden rounded-card shadow-lift"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SRC}
          alt="Ubicación de Capua de Edilizia en Funes"
          className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-navy/10" />
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-navy/60 text-cream opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Expand size={16} />
        </span>
      </button>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: SRC, alt: 'Ubicación de Capua de Edilizia en Funes' }]}
      />
    </>
  );
}
