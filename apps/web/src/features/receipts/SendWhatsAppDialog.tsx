import { useState } from 'react';
import { toast } from '@/lib/toast';
import { MessageCircle, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { errorMessage } from '@/lib/api-error';
import { useSendWhatsApp } from './queries';
import type { Receipt, WhatsAppType } from './types';

type SendWhatsAppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
  type: WhatsAppType;
};

/** Texto de la plantilla con las variables resueltas (espejo de lo aprobado en Meta). */
function previewText(type: WhatsAppType, name: string, month: string, year: number): string {
  return type === 'rendicion'
    ? `Hola ${name}, adjuntamos la rendición de ${month}/${year} de tu propiedad. Saludos, Inmobiliaria NZ.`
    : `Hola ${name}, te enviamos el recibo de alquiler de ${month}/${year}. Ante cualquier consulta quedamos a disposición. Inmobiliaria NZ.`;
}

/**
 * El padre monta este componente con `key` por recibo+tipo, así el destinatario y el
 * teléfono prellenado se inicializan frescos en cada apertura (sin efecto).
 */
export function SendWhatsAppDialog({ open, onOpenChange, receipt, type }: SendWhatsAppDialogProps) {
  const sendWhatsApp = useSendWhatsApp();

  const isRendicion = type === 'rendicion';
  const party = isRendicion ? receipt?.contract?.owner : receipt?.contract?.tenant;
  const recipientRole = isRendicion ? 'Dueño' : 'Inquilino';
  const recipientName = party?.name ?? '—';

  const [phone, setPhone] = useState(party?.phone ?? '');

  if (!receipt) return null;

  const filename = `${type}-${receipt.number}.pdf`;
  const preview = previewText(type, recipientName, receipt.month, receipt.year);

  function handleSend() {
    if (!receipt) return;
    sendWhatsApp.mutate(
      { number: receipt.number, input: { type, phone: phone.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success(`Enviando ${type} por WhatsApp a ${recipientName}.`);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(errorMessage(error, 'No pudimos enviar el mensaje.'));
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="size-5 text-emerald-600" />
            Enviar {isRendicion ? 'rendición' : 'recibo'} por WhatsApp
          </DialogTitle>
          <DialogDescription>
            {recipientRole}: <span className="font-medium text-foreground">{recipientName}</span> · Recibo #
            {receipt.number} · {receipt.month} {receipt.year}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp-phone">Teléfono destino</Label>
            <Input
              id="whatsapp-phone"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 351 1234567"
            />
            <p className="text-xs text-muted-foreground">
              Prellenado de la ficha. Se normaliza a formato internacional al enviar.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Mensaje</Label>
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground/90">{preview}</p>
            <p className="text-xs text-muted-foreground">Adjunto: {filename}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sendWhatsApp.isPending}>
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleSend}
            disabled={sendWhatsApp.isPending || phone.trim() === ''}
          >
            <Send className="size-4" />
            {sendWhatsApp.isPending ? 'Enviando…' : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
