import { CheckCircle2, Clock, RotateCw, XCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/api-error';
import { useBatch, useRetryBatch } from './queries';
import type { WhatsAppStatus } from './types';

function StatusIcon({ status }: { status: WhatsAppStatus }) {
  if (status === 'sent') return <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />;
  if (status === 'failed') return <XCircle className="size-4 shrink-0 text-destructive" />;
  return <Clock className="size-4 shrink-0 animate-pulse text-muted-foreground" />;
}

type BatchProgressProps = {
  batchId: string;
  /** Al reintentar se genera un lote nuevo: el padre cambia a ese batch. */
  onRetry: (newBatchId: string) => void;
  onClose: () => void;
};

export function BatchProgress({ batchId, onRetry, onClose }: BatchProgressProps) {
  const { data } = useBatch(batchId);
  const retry = useRetryBatch();

  if (!data) return <p className="text-sm text-muted-foreground">Iniciando envío…</p>;

  const done = data.total - data.queued;
  const pct = data.total > 0 ? Math.round((done / data.total) * 100) : 0;
  const finished = data.queued === 0;

  function handleRetry() {
    retry.mutate(batchId, {
      onSuccess: (res) => {
        if (res.total > 0) onRetry(res.batch_id);
        else toast.info('No hay fallidos para reintentar.');
      },
      onError: (e) => toast.error(errorMessage(e, 'No pudimos reintentar.')),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm">
          <span>{finished ? 'Envío finalizado' : 'Enviando…'}</span>
          <span className="tabular-nums text-muted-foreground">
            {done}/{data.total}
          </span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
          <span>✓ {data.sent} enviados</span>
          <span>✗ {data.failed} fallidos</span>
          <span>… {data.queued} en cola</span>
        </div>
      </div>

      <ul className="max-h-72 divide-y overflow-y-auto rounded-md border">
        {data.messages.map((m) => (
          <li key={m.id} className="flex items-center gap-2 px-3 py-2 text-sm">
            <StatusIcon status={m.status} />
            <span className="font-medium">{m.recipient_name ?? m.recipient_phone}</span>
            <span className="text-xs text-muted-foreground">{m.recipient_phone}</span>
            {m.status === 'failed' && m.error && (
              <span className="ml-auto max-w-[40%] truncate text-xs text-destructive" title={m.error}>
                {m.error}
              </span>
            )}
          </li>
        ))}
      </ul>

      {finished && (
        <div className="flex justify-end gap-2">
          {data.failed > 0 && (
            <Button variant="outline" onClick={handleRetry} disabled={retry.isPending}>
              <RotateCw className="size-4" />
              Reintentar fallidos ({data.failed})
            </Button>
          )}
          <Button onClick={onClose}>Listo</Button>
        </div>
      )}
    </div>
  );
}
