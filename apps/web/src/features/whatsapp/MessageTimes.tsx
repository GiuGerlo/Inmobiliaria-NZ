import { formatDateTime } from '@/lib/format';
import type { WhatsAppMessage } from './types';

/** Línea de tiempo de un mensaje: enviado → entregado → leído (solo los pasos que ocurrieron). */
export function MessageTimes({ message }: { message: WhatsAppMessage }) {
  const steps = [
    ['Enviado', message.sent_at],
    ['Entregado', message.delivered_at],
    ['Leído', message.read_at],
  ].filter((s): s is [string, string] => !!s[1]);

  if (steps.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
      {steps.map(([label, at]) => (
        <span key={label}>
          {label}: {formatDateTime(at)}
        </span>
      ))}
    </div>
  );
}
