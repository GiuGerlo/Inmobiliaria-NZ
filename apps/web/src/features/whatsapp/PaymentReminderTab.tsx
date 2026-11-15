import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { errorMessage } from '@/lib/api-error';
import { useTenants } from '@/features/tenants/queries';
import { useDashboard } from '@/features/dashboard/queries';
import { useSendPaymentReminders } from './queries';
import { BatchProgress } from './BatchProgress';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function previewText(deadline: string): string {
  const month = MONTHS[new Date().getMonth()];
  return `Buen día! En el mes de ${month} vamos a tomar los pagos hasta el día ${deadline || '…'}. Les solicitamos tengan a bien hacer los pagos antes de esa fecha para poder hacer la entrega correspondiente a los propietarios. Desde ya muchas gracias. Saludos. Estudio Jurídico Inmobiliario ZARANICH.`;
}

export function PaymentReminderTab() {
  const { data, isLoading: tenantsLoading } = useTenants({ page: 1, perPage: 100 });
  const dashboard = useDashboard();
  const tenants = [...(data?.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const isLoading = tenantsLoading || dashboard.isLoading;
  const [search, setSearch] = useState('');
  const [deadline, setDeadline] = useState('');
  // null = sin tocar: arranca con los inquilinos que todavía no tienen recibo del mes.
  const [picked, setPicked] = useState<Set<number> | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const send = useSendPaymentReminders();

  const unpaid = new Set((dashboard.data?.pending_receipts ?? []).map((c) => c.tenant_id));
  const selected = picked ?? unpaid;
  const selectedTenants = tenants.filter((t) => selected.has(t.id));
  const selectedIds = selectedTenants.map((t) => t.id);
  const term = search.trim().toLowerCase();
  const visible = term
    ? tenants.filter((t) => t.name.toLowerCase().includes(term) || t.phone.includes(term))
    : tenants;

  function toggle(id: number) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  }

  function openConfirm() {
    if (!deadline.trim()) {
      toast.error('Escribí la fecha límite.');
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('Seleccioná al menos un inquilino.');
      return;
    }
    setConfirmOpen(true);
  }

  function doSend() {
    setConfirmOpen(false);
    send.mutate(
      { tenantIds: selectedIds, deadline: deadline.trim() },
      {
        onSuccess: (res) => {
          setBatchId(res.batch_id);
          if (res.skipped.length) {
            toast.warning(`${res.skipped.length} sin teléfono válido: ${res.skipped.join(', ')}`);
          }
        },
        onError: (e) => toast.error(errorMessage(e, 'No pudimos iniciar el envío.')),
      },
    );
  }

  if (batchId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Envío de recordatorio de pago</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchProgress batchId={batchId} onRetry={setBatchId} onClose={() => setBatchId(null)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recordatorio de pago mensual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="deadline">Fecha límite (como va en el mensaje, en mayúsculas)</Label>
          <Input
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="MIÉRCOLES 10 AL MEDIODÍA"
          />
        </div>

        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap">
          {previewText(deadline)}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <Label>Destinatarios ({selectedIds.length} de {tenants.length})</Label>
            <div className="flex gap-3 text-xs">
              <button type="button" className="text-muted-foreground underline" onClick={() => setPicked(unpaid)}>
                Solo sin recibo
              </button>
              <button
                type="button"
                className="text-muted-foreground underline"
                onClick={() => setPicked(new Set(tenants.map((t) => t.id)))}
              >
                Seleccionar todos
              </button>
              <button type="button" className="text-muted-foreground underline" onClick={() => setPicked(new Set())}>
                Deseleccionar todos
              </button>
            </div>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Arranca tildado solo quien todavía no tiene recibo de {MONTHS[new Date().getMonth()]}.
          </p>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando inquilinos…</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Izquierda: todos, alfabético, con buscador. */}
              <div className="rounded-md border">
                <div className="border-b p-2">
                  <Input
                    aria-label="Buscar inquilino"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar inquilino o teléfono…"
                  />
                </div>
                <div className="max-h-80 overflow-y-auto p-1">
                  {visible.length === 0 && (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">Sin resultados.</p>
                  )}
                  {visible.map((t) => (
                    <label
                      key={t.id}
                      htmlFor={`tenant-${t.id}`}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        id={`tenant-${t.id}`}
                        checked={selected.has(t.id)}
                        onChange={() => toggle(t.id)}
                        className="size-4 accent-[#13294b]"
                      />
                      <span className="flex-1 truncate">{t.name}</span>
                      {unpaid.has(t.id) && (
                        <span className="rounded bg-amber-50 px-1.5 text-xs text-amber-700">sin recibo</span>
                      )}
                      <span className="text-xs text-muted-foreground">{t.phone}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Derecha: los seleccionados, uno abajo del otro. */}
              <div className="rounded-md border">
                <div className="border-b px-3 py-2.5 text-sm font-medium">
                  Seleccionados ({selectedTenants.length})
                </div>
                <ul className="max-h-80 overflow-y-auto p-1">
                  {selectedTenants.length === 0 && (
                    <li className="px-2 py-1.5 text-sm text-muted-foreground">Nadie seleccionado.</li>
                  )}
                  {selectedTenants.map((t) => (
                    <li key={t.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50">
                      <span className="flex-1 truncate">{t.name}</span>
                      <span className="text-xs text-muted-foreground">{t.phone}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label={`Quitar a ${t.name}`}
                        onClick={() => toggle(t.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={openConfirm} disabled={send.isPending}>
            Enviar a {selectedIds.length}
          </Button>
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Enviar recordatorio de pago"
        description={`Se enviará el mensaje a ${selectedIds.length} inquilino(s). ¿Confirmás?`}
        confirmLabel="Enviar"
        doubleConfirm={false}
        loading={send.isPending}
        onConfirm={doSend}
      />
    </Card>
  );
}
