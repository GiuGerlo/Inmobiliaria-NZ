import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { STATUS_LABEL, type WhatsAppStatus } from '@/features/whatsapp/types';

const COLOR: Record<WhatsAppStatus, string> = {
  queued: 'bg-slate-400',
  sent: 'bg-slate-400',
  delivered: 'bg-emerald-600',
  read: 'bg-emerald-600',
  failed: 'bg-destructive',
};

type SentMarkProps = {
  status?: WhatsAppStatus | null;
  sentAt?: string | null;
};

/**
 * Tilde chico en la esquina del botón Recibo/Rendición con el estado del último envío por
 * WhatsApp: gris enviado, verde entregado/leído, rojo falló. El padre debe ser `relative`.
 */
export function SentMark({ status, sentAt }: SentMarkProps) {
  if (!status) return null;
  const Icon = status === 'failed' ? X : Check;
  const label = `WhatsApp: ${STATUS_LABEL[status]}${sentAt ? ` · ${formatDateTime(sentAt)}` : ''}`;

  return (
    <span
      aria-label={label}
      className={cn(
        'pointer-events-none absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full text-white ring-2 ring-background',
        COLOR[status],
      )}
    >
      <Icon className="size-2.5" strokeWidth={3} />
    </span>
  );
}
