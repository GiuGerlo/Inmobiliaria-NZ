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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/lib/format';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { useMessages } from './queries';
import { MessageTimes } from './MessageTimes';
import { StatusBadge } from './StatusBadge';
import {
  STATUS_LABEL,
  TYPE_LABEL,
  type MessageFilters,
  type WhatsAppMessage,
  type WhatsAppStatus,
  type WhatsAppType,
} from './types';

const SELECT_CLASS = 'h-9 rounded-md border bg-background px-2 text-sm';

export function MessageHistory() {
  const [filters, setFilters] = useState<MessageFilters>({});
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search, 300);
  const { data, isLoading } = useMessages(1, 50, { ...filters, q });
  const messages = data?.data ?? [];
  const [detail, setDetail] = useState<WhatsAppMessage | null>(null);
  const filtering = !!(q || filters.type || filters.status || filters.from || filters.to);

  const set = (patch: MessageFilters) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de mensajes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="grid gap-1.5 lg:col-span-2">
            <Label htmlFor="history-q">Buscar</Label>
            <Input
              id="history-q"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre o teléfono…"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="history-type">Tipo</Label>
            <select
              id="history-type"
              className={SELECT_CLASS}
              value={filters.type ?? ''}
              onChange={(e) => set({ type: e.target.value as WhatsAppType | '' })}
            >
              <option value="">Todos</option>
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="history-status">Estado</Label>
            <select
              id="history-status"
              className={SELECT_CLASS}
              value={filters.status ?? ''}
              onChange={(e) => set({ status: e.target.value as WhatsAppStatus | '' })}
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="history-from">Desde</Label>
              <Input
                id="history-from"
                type="date"
                value={filters.from ?? ''}
                onChange={(e) => set({ from: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="history-to">Hasta</Label>
              <Input
                id="history-to"
                type="date"
                value={filters.to ?? ''}
                onChange={(e) => set({ to: e.target.value })}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {filtering ? 'No hay mensajes con esos filtros.' : 'Todavía no se enviaron mensajes.'}
          </p>
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
                <MessageTimes message={detail} />
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
