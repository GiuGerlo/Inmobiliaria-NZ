import { useMessages } from '@/features/whatsapp/queries';
import { MessageTimes } from '@/features/whatsapp/MessageTimes';
import { StatusBadge } from '@/features/whatsapp/StatusBadge';
import { TYPE_LABEL } from '@/features/whatsapp/types';

/** Mini historial de envíos por WhatsApp de un recibo (recibo al inquilino, rendición al dueño). */
export function ReceiptWhatsAppLog({ receiptNumber }: { receiptNumber: number }) {
  const { data, isLoading } = useMessages(1, 20, { receiptId: receiptNumber });
  const messages = data?.data ?? [];

  return (
    <div className="mt-5">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Envíos por WhatsApp
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no se envió por WhatsApp.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {messages.map((m) => (
            <li key={m.id} className="space-y-1 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span>
                  <span className="font-medium">{TYPE_LABEL[m.type]}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    → {m.recipient_name ?? m.recipient_phone}
                  </span>
                </span>
                <StatusBadge status={m.status} />
              </div>
              <MessageTimes message={m} />
              {m.status === 'failed' && m.error && <p className="text-xs text-destructive">{m.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
