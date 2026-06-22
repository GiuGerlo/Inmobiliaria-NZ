import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SaleProperty } from './types';

type SalePropertyGalleryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: SaleProperty | null;
};

export function SalePropertyGalleryDialog({
  open,
  onOpenChange,
  property,
}: SalePropertyGalleryDialogProps) {
  const images = property?.images ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Resetea al abrir / cambiar de propiedad (estado transitorio sincronizado con prop).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setIndex(0);
  }, [open, property]);

  const total = images.length;
  const current = images[index];

  function go(delta: number) {
    setIndex((prev) => (prev + delta + total) % total);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{property?.title ?? 'Fotos'}</DialogTitle>
          <DialogDescription>
            {total > 0 ? `Imagen ${index + 1} de ${total}` : 'Sin imágenes.'}
          </DialogDescription>
        </DialogHeader>

        {total === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground">
            <ImageOff className="size-8" />
            <p className="text-sm">Esta propiedad no tiene fotos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative flex items-center justify-center overflow-hidden rounded-md bg-muted">
              <img
                src={current.url}
                alt={`Foto ${index + 1}`}
                className="max-h-[60vh] w-full object-contain"
              />
              {total > 1 && (
                <>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    aria-label="Anterior"
                    onClick={() => go(-1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    aria-label="Siguiente"
                    onClick={() => go(1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                </>
              )}
            </div>

            {total > 1 && (
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    aria-label={`Ver foto ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      'size-14 overflow-hidden rounded-md border transition-opacity',
                      i === index ? 'ring-2 ring-ring' : 'opacity-70 hover:opacity-100',
                    )}
                  >
                    <img src={img.url} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
