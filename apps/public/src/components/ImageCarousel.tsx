'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export interface CarouselImage {
  src: string;
  alt?: string;
}

export function ImageCarousel({
  images,
  aspect = 'aspect-[16/10]',
  thumbnails = false,
}: {
  images: CarouselImage[];
  aspect?: string;
  /** Muestra una tira de miniaturas sincronizada en vez de los dots. */
  thumbnails?: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });
  const [selected, setSelected] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const i = emblaApi.selectedScrollSnap();
    setSelected(i);
    thumbsApi?.scrollTo(i);
  }, [emblaApi, thumbsApi]);

  const onThumbClick = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div className={`overflow-hidden rounded-card bg-navy/5 ${aspect}`} ref={emblaRef}>
        <div className="flex h-full">
          {images.map((img, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="group relative h-full min-w-0 flex-[0_0_100%] cursor-zoom-in"
              aria-label="Ampliar imagen"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt ?? ''} className="h-full w-full object-cover" />
              <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-navy/60 text-cream opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <Expand size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow-soft transition-colors hover:bg-gold hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow-soft transition-colors hover:bg-gold hover:text-white"
          >
            <ChevronRight size={20} />
          </button>

          {thumbnails ? (
            <div className="mt-4 overflow-hidden" ref={thumbsRef}>
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => onThumbClick(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    className={`group relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-all duration-300 sm:h-20 sm:w-28 ${
                      i === selected
                        ? 'opacity-100 ring-2 ring-gold ring-offset-2 ring-offset-cream'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt ?? ''}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {images.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Ir a la imagen ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === selected ? 'w-7 bg-gold' : 'w-1.5 bg-navy/20 hover:bg-navy/40'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={images.map((img) => ({ src: img.src, alt: img.alt }))}
      />
    </div>
  );
}
