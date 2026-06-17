import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Contract } from '@/features/contracts/types';
import { useDashboard } from './queries';
import { StatCards } from './StatCards';
import { QuickActions } from './QuickActions';
import { MonthProgress } from './MonthProgress';
import { PendingReceiptsCard } from './PendingReceiptsCard';
import { ExpiringContractsCard } from './ExpiringContractsCard';
import { LatestReceiptsCard } from './LatestReceiptsCard';
import { BalanceContractsCard } from './BalanceContractsCard';

/** "Junio 2026" con la inicial en mayúscula. */
function currentMonthLabel(): string {
  const label = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(
    new Date(),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboard();

  function createReceiptFor(contract: Contract) {
    navigate('/recibos', { state: { createForContract: contract } });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
          <span className="h-5 w-px bg-border" aria-hidden />
          <span className="text-sm font-medium capitalize text-nz-gold">
            {currentMonthLabel()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Resumen operativo de la inmobiliaria de un vistazo.
        </p>
      </header>

      {isError ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No pudimos cargar el resumen. Probá recargar la página.
        </Card>
      ) : isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <QuickActions />
          <StatCards totals={data.totals} />
          <MonthProgress
            active={data.totals.active_contracts}
            pending={data.pending_receipts.length}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <PendingReceiptsCard contracts={data.pending_receipts} onCreate={createReceiptFor} />
            <ExpiringContractsCard items={data.expiring_contracts} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <LatestReceiptsCard receipts={data.latest_receipts} />
            <BalanceContractsCard contracts={data.contracts_with_balance} />
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
