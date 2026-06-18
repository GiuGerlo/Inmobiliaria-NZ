import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { errorMessage } from '@/lib/api-error';
import { useTenants } from '@/features/tenants/queries';
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
  const { data, isLoading } = useTenants({ page: 1, perPage: 100 });
  const tenants = data?.data ?? [];
  const [deadline, setDeadline] = useState('');
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const send = useSendPaymentReminders();

  const selectedIds = tenants.filter((t) => !excluded.has(t.id)).map((t) => t.id);

  function toggle(id: number) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
              <button type="button" className="text-muted-foreground underline" onClick={() => setExcluded(new Set())}>
                Seleccionar todos
              </button>
              <button
                type="button"
                className="text-muted-foreground underline"
                onClick={() => setExcluded(new Set(tenants.map((t) => t.id)))}
              >
                Deseleccionar todos
              </button>
            </div>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando inquilinos…</p>
          ) : (
            <div className="grid max-h-80 grid-cols-1 gap-x-6 overflow-y-auto rounded-md border p-1 sm:grid-cols-2">
              {tenants.map((t) => (
                <label
                  key={t.id}
                  htmlFor={`tenant-${t.id}`}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    id={`tenant-${t.id}`}
                    checked={!excluded.has(t.id)}
                    onChange={() => toggle(t.id)}
                    className="size-4 accent-[#13294b]"
                  />
                  <span className="flex-1 truncate">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.phone}</span>
                </label>
              ))}
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
