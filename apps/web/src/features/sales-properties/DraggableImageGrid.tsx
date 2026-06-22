import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { cn } from '@/lib/utils';
import { reorder } from './reorder';
import type { PropertyImage } from './types';

function Thumb({
  image,
  onRemove,
}: {
  image: PropertyImage;
  onRemove: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ id: image.id }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      dropTargetForElements({
        element: el,
        getData: () => ({ id: image.id }),
        canDrop: ({ source }) => source.data.id !== image.id,
        onDragEnter: () => setOver(true),
        onDragLeave: () => setOver(false),
        onDrop: () => setOver(false),
      }),
    );
  }, [image.id]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative size-20 cursor-grab overflow-hidden rounded-md border transition-opacity',
        dragging && 'opacity-40',
        over && 'ring-2 ring-ring',
      )}
    >
      <img src={image.url} alt="" className="size-full object-cover" draggable={false} />
      <button
        type="button"
        aria-label="Quitar foto"
        onClick={() => onRemove(image.id)}
        className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground hover:bg-background"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

type DraggableImageGridProps = {
  images: PropertyImage[];
  onReorder: (ids: number[]) => void;
  onRemove: (id: number) => void;
};

/** Grilla de fotos existentes con reordenamiento por arrastre (pragmatic-dnd). */
export function DraggableImageGrid({ images, onReorder, onRemove }: DraggableImageGridProps) {
  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const target = location.current.dropTargets[0];
        if (!target) return;
        const from = images.findIndex((i) => i.id === source.data.id);
        const to = images.findIndex((i) => i.id === target.data.id);
        if (from === -1 || to === -1) return;
        onReorder(reorder(images, from, to).map((i) => i.id));
      },
    });
  }, [images, onReorder]);

  return (
    <>
      {images.map((image) => (
        <Thumb key={image.id} image={image} onRemove={onRemove} />
      ))}
    </>
  );
}
