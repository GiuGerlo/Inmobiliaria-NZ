import { useEffect, useState } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  /** Pide un segundo "¿estás seguro?" antes de ejecutar (default true). */
  doubleConfirm?: boolean;
  onConfirm: () => void;
};

/** Diálogo de confirmación reutilizable con doble confirmación para acciones irreversibles. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  doubleConfirm = true,
  onConfirm,
}: ConfirmDialogProps) {
  const [armed, setArmed] = useState(false);

  // Resetea el segundo paso cada vez que se cierra el diálogo (patrón estándar
  // de sincronizar estado transitorio con una prop controlada).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setArmed(false);
  }, [open]);

  function handleConfirm() {
    if (doubleConfirm && !armed) {
      setArmed(true);
      return;
    }
    onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{armed ? '¿Estás seguro?' : title}</DialogTitle>
          {armed ? (
            <DialogDescription className="flex items-start gap-2 text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              Esta acción es permanente y no se puede deshacer. Confirmá para continuar.
            </DialogDescription>
          ) : (
            description && <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {armed ? `Sí, ${confirmLabel.toLowerCase()}` : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
