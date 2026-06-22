import { useState } from 'react';
import { toast } from '@/lib/toast';
import { Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { errorMessage } from '@/lib/api-error';
import type { Tenant } from '@/features/tenants/types';
import { useSendMissingItems } from './queries';

const CONCEPTS = ['municipal', 'agua', 'electricidad', 'gas', 'honorarios', 'arreglos', 'otros'];
const ACTIONS = ['pasarme foto del pago', 'pasarme el pago', 'pasarme el comprobante'];

function compose(action: string, concepts: string[]): string {
  if (concepts.length === 0) return action;
  return `${action} de ${concepts.join(' y ')}`;
}

type Props = {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Se monta con `key` por inquilino → estado inicial limpio sin efecto. */
export function MissingItemsDialog({ tenant, open, onOpenChange }: Props) {
  const send = useSendMissingItems();
  const [action, setAction] = useState(ACTIONS[0]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  if (!tenant) return null;

  function toggleConcept(concept: string) {
    const next = concepts.includes(concept)
      ? concepts.filter((c) => c !== concept)
      : [...concepts, concept];
    setConcepts(next);
    setMessage(compose(action, next));
  }

  function changeAction(value: string) {
    setAction(value);
    setMessage(compose(value, concepts));
  }

  const preview = `Hola ${tenant.name}, desde Estudio Zaranich te recordamos: ${message || '…'}. ¡Gracias!`;

  function handleSend() {
    if (!tenant || message.trim() === '') {
      toast.error('Escribí qué le falta.');
      return;
    }
    send.mutate(
      { tenantId: tenant.id, message: message.trim() },
      {
        onSuccess: (result) => {
          if (result.status === 'failed') {
            toast.error(result.error ?? 'El mensaje no se pudo entregar.');
            return; // dejamos el modal abierto para reintentar
          }
          toast.success(`Recordatorio enviado a ${tenant.name}.`);
          onOpenChange(false);
        },
        onError: (e) => toast.error(errorMessage(e, 'No pudimos enviar el recordatorio.')),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recordatorio de faltantes</DialogTitle>
          <DialogDescription>
            Para <span className="font-medium text-foreground">{tenant.name}</span> · {tenant.phone}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="action">Acción</Label>
            <select
              id="action"
              value={action}
              onChange={(e) => changeAction(e.target.value)}
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Conceptos</Label>
            <div className="mt-1 flex flex-wrap gap-3">
              {CONCEPTS.map((c) => (
                <label key={c} className="flex items-center gap-1.5 text-sm capitalize">
                  <input
                    type="checkbox"
                    checked={concepts.includes(c)}
                    onChange={() => toggleConcept(c)}
                    className="size-4 accent-[#13294b]"
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="message">Texto (editable)</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="rounded-md border bg-transparent px-3 py-2 text-sm"
              placeholder="pasarme foto del pago de municipal"
            />
          </div>

          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{preview}</div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={send.isPending}>
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleSend}
            disabled={send.isPending || message.trim() === ''}
          >
            <Send className="size-4" />
            {send.isPending ? 'Enviando…' : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
