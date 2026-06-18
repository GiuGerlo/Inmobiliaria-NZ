import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/format';
import { useMessages } from './queries';
import type { WhatsAppMessage, WhatsAppStatus, WhatsAppType } from './types';

const TYPE_LABEL: Record<WhatsAppType, string> = {
  recibo: 'Recibo',
  rendicion: 'Rendición',
  recordatorio_pago: 'Pago',
  recordatorio_faltante: 'Faltante',
};

const STATUS_STYLE: Record<WhatsAppStatus, string> = {
  sent: 'text-emerald-700 bg-emerald-50',
  failed: 'text-destructive bg-destructive/10',
  queued: 'text-muted-foreground bg-muted',
};

const STATUS_LABEL: Record<WhatsAppStatus, string> = {
  sent: 'Enviado',
  failed: 'Falló',
  queued: 'En cola',
};

function StatusBadge({ status }: { status: WhatsAppStatus }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function MessageHistory() {
  const { data, isLoading } = useMessages(1, 50);
  const messages = data?.data ?? [];
  const [detail, setDetail] = useState<WhatsAppMessage | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de mensajes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no se enviaron mensajes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Fecha</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">Destinatario</th>
                  <th className="py-2 pr-3">Mensaje</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                      {m.created_at ? formatDateTime(m.created_at) : '—'}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{TYPE_LABEL[m.type]}</td>
                    <td className="py-2 pr-3">
                      <div>{m.recipient_name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{m.recipient_phone}</div>
                    </td>
                    <td className="max-w-xs truncate py-2 pr-3" title={m.body ?? ''}>
                      {m.body ?? '—'}
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Ver detalle del mensaje ${m.id}`}
                        onClick={() => setDetail(m)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {TYPE_LABEL[detail.type]} <StatusBadge status={detail.status} />
                </DialogTitle>
                <DialogDescription>
                  {detail.recipient_name ?? '—'} · {detail.recipient_phone}
                  {detail.created_at ? ` · ${formatDateTime(detail.created_at)}` : ''}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mensaje
                  </div>
                  <p className="rounded-md border bg-muted/40 px-3 py-2 whitespace-pre-wrap">
                    {detail.body ?? '—'}
                  </p>
                </div>
                {detail.status === 'failed' && detail.error && (
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">
                      Error
                    </div>
                    <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">
                      {detail.error}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
