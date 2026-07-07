import { Loader2, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from '@/lib/toast';
import { errorMessage } from '@/lib/api-error';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useDisableMaintenance,
  useEnableMaintenance,
  useMaintenance,
  useUpdateMaintenanceIp,
} from './queries';

export function MaintenancePage() {
  const { data, isLoading } = useMaintenance();
  const enable = useEnableMaintenance();
  const disable = useDisableMaintenance();
  const updateIp = useUpdateMaintenanceIp();
  const busy = enable.isPending || disable.isPending || updateIp.isPending;

  const enabled = data?.enabled ?? false;
  const ipMismatch = Boolean(
    enabled && data?.allowed_ip && data?.your_ip && data.allowed_ip !== data.your_ip,
  );

  function toggle() {
    const mut = enabled ? disable : enable;
    mut.mutate(undefined, {
      onSuccess: () =>
        toast.success(enabled ? 'Mantenimiento desactivado.' : 'Mantenimiento activado.'),
      onError: (e) => toast.error(errorMessage(e, 'No pudimos cambiar el estado.')),
    });
  }

  function refreshIp() {
    updateIp.mutate(undefined, {
      onSuccess: () => toast.success('IP permitida actualizada a la tuya.'),
      onError: (e) => toast.error(errorMessage(e, 'No pudimos actualizar la IP.')),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Modo mantenimiento</h1>
        <p className="text-sm text-muted-foreground">
          Bloquea el sitio público y el admin para todos, menos tu IP y tu sesión de superadmin.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {enabled ? (
              <ShieldAlert className="size-5 text-amber-600" />
            ) : (
              <ShieldCheck className="size-5 text-emerald-600" />
            )}
            Estado
            <Badge variant={enabled ? 'default' : 'secondary'} className="ml-auto">
              {enabled ? 'Activado' : 'Desactivado'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {enabled
              ? 'El sitio está en mantenimiento. Solo tu IP permitida y tu sesión de superadmin entran.'
              : 'El sitio funciona normal para todos.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Tu IP actual</dt>
                <dd className="text-right font-mono">{data?.your_ip ?? '—'}</dd>
                <dt className="text-muted-foreground">IP permitida</dt>
                <dd className="text-right font-mono">{data?.allowed_ip ?? '—'}</dd>
              </dl>

              {ipMismatch && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                  Tu IP actual no coincide con la permitida. Si no ves el sitio público, actualizá la
                  IP con el botón de abajo.
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={toggle} disabled={busy} variant={enabled ? 'outline' : 'default'}>
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {enabled ? 'Desactivar mantenimiento' : 'Activar mantenimiento'}
                </Button>
                {enabled && (
                  <Button variant="outline" onClick={refreshIp} disabled={busy}>
                    <RefreshCw className="size-4" />
                    Actualizar a mi IP
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
