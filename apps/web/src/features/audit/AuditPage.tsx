import { useState } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/lib/format';
import { useUsers } from '@/features/users/queries';
import { useAuditLogs } from './api';
import { AuditChanges } from './AuditChanges';
import {
  EVENT_FILTERS,
  TYPE_LABEL,
  eventLabel,
  subjectLabel,
  type AuditFilters,
  type AuditLog,
} from './types';

const SELECT_CLASS = 'h-9 rounded-md border bg-background px-2 text-sm';

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AuditLog | null>(null);
  const { data, isLoading, isFetching, refetch } = useAuditLogs(page, filters);
  const { data: users } = useUsers(1, 100);
  const logs = data?.data ?? [];
  const lastPage = data?.meta.last_page ?? 1;

  const set = (patch: AuditFilters) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Auditoría</h1>
          <p className="text-sm text-muted-foreground">
            Quién hizo qué y cuándo: cambios de datos, ingresos al panel, envíos por WhatsApp y PDFs.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="grid gap-1.5">
              <Label htmlFor="audit-user">Usuario</Label>
              <select
                id="audit-user"
                className={SELECT_CLASS}
                value={filters.userId ?? ''}
                onChange={(e) => set({ userId: e.target.value })}
              >
                <option value="">Todos</option>
                {users?.data.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="audit-event">Acción</Label>
              <select
                id="audit-event"
                className={SELECT_CLASS}
                value={filters.event ?? ''}
                onChange={(e) => set({ event: e.target.value })}
              >
                <option value="">Todas</option>
                {Object.entries(EVENT_FILTERS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="audit-type">Registro</Label>
              <select
                id="audit-type"
                className={SELECT_CLASS}
                value={filters.type ?? ''}
                onChange={(e) => set({ type: e.target.value })}
              >
                <option value="">Todos</option>
                {Object.entries(TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <div className="grid gap-1.5">
                <Label htmlFor="audit-from">Desde</Label>
                <Input
                  id="audit-from"
                  type="date"
                  value={filters.from ?? ''}
                  onChange={(e) => set({ from: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="audit-to">Hasta</Label>
                <Input
                  id="audit-to"
                  type="date"
                  value={filters.to ?? ''}
                  onChange={(e) => set({ to: e.target.value })}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay registros con esos filtros.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">Fecha</th>
                    <th className="py-2 pr-3">Usuario</th>
                    <th className="py-2 pr-3">Acción</th>
                    <th className="py-2 pr-3">Registro</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                        {log.created_at ? formatDateTime(log.created_at) : '—'}
                      </td>
                      <td className="py-2 pr-3">{log.user_name ?? 'Sistema'}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{eventLabel(log.event)}</td>
                      <td className="py-2 pr-3">{subjectLabel(log)}</td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Ver detalle del registro ${log.id}`}
                          onClick={() => setDetail(log)}
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

          <div className="flex items-center justify-end gap-2 text-sm">
            <span className="text-muted-foreground">
              Página {page} de {lastPage}
            </span>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
              Siguiente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {eventLabel(detail.event)} · {subjectLabel(detail)}
                </DialogTitle>
                <DialogDescription>
                  {detail.user_name ?? 'Sistema'}
                  {detail.created_at ? ` · ${formatDateTime(detail.created_at)}` : ''}
                  {detail.ip ? ` · IP ${detail.ip}` : ''}
                </DialogDescription>
              </DialogHeader>
              <AuditChanges log={detail} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
