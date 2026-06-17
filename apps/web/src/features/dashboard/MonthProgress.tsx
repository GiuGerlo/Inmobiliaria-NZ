import { Card, CardContent } from '@/components/ui/card';

type MonthProgressProps = {
  /** Contratos activos en total. */
  active: number;
  /** Contratos activos que todavía no tienen recibo este mes. */
  pending: number;
};

export function MonthProgress({ active, pending }: MonthProgressProps) {
  const emitted = Math.max(active - pending, 0);
  const percent = active > 0 ? Math.round((emitted / active) * 100) : 0;

  return (
    <Card>
      <CardContent className="space-y-3 py-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium">Recibos emitidos este mes</p>
            <p className="text-xs text-muted-foreground">
              {active > 0
                ? `${emitted} de ${active} contratos activos`
                : 'Sin contratos activos'}
            </p>
          </div>
          <span className="text-2xl font-semibold tabular-nums text-primary">{percent}%</span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso de recibos del mes"
        >
          <div
            className="h-full rounded-full bg-nz-gold transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
