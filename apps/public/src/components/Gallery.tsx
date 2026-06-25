'use client';

import { useState } from 'react';
import { Expand } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import type { CarouselImage } from './ImageCarousel';

// Bento tuneado para 5 imágenes: 1 destacada (2x2) + relleno sin huecos.
// ponytail: pensado para el set fijo de 5 fotos del interior de Capua; con otra
// cantidad cae a una grilla uniforme.
const SPANS_5 = [
  'col-span-2 row-span-2',
  '',
  '',
  'col-span-2 sm:col-span-1',
  'col-span-2 sm:col-span-2',
];

export function Gallery({ images }: { images: CarouselImage[] }) {
  const [index, setIndex] = useState(-1);
  if (images.length === 0) return null;

  const useBento = images.length === 5;

  return (
    <>
      <div
        className={
          useBento
            ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:auto-rows-[200px] lg:auto-rows-[240px]'
            : 'grid grid-cols-2 gap-3 sm:grid-cols-3'
        }
      >
        {images.map((img, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setIndex(i)}
            aria-label="Ampliar imagen"
            className={`group relative cursor-zoom-in overflow-hidden rounded-card bg-navy/5 shadow-soft ${
              useBento ? `aspect-[4/3] sm:aspect-auto sm:h-full ${SPANS_5[i]}` : 'aspect-[4/3]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt ?? ''}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-navy/20" />
            <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-navy/60 text-cream opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <Expand size={16} />
            </span>
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index < 0 ? 0 : index}
        close={() => setIndex(-1)}
        slides={images.map((img) => ({ src: img.src, alt: img.alt }))}
      />
    </>
  );
}
