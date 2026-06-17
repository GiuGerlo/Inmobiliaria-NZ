import { Building2, FileText, Receipt, Users, UserSquare, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DashboardTotals } from './types';

type Stat = {
  label: string;
  value: number;
  icon: LucideIcon;
};

function buildStats(totals: DashboardTotals): Stat[] {
  return [
    { label: 'Propiedades', value: totals.properties, icon: Building2 },
    { label: 'Dueños', value: totals.owners, icon: UserSquare },
    { label: 'Inquilinos', value: totals.tenants, icon: Users },
    { label: 'Contratos activos', value: totals.active_contracts, icon: FileText },
    { label: 'Recibos del mes', value: totals.receipts_this_month, icon: Receipt },
  ];
}

export function StatCards({ totals }: { totals: DashboardTotals }) {
  const stats = buildStats(totals);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="group relative gap-0 overflow-hidden p-5 transition-shadow duration-200 hover:shadow-md animate-in fade-in-50 slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Hairline dorado de marca en el borde superior */}
            <span className="absolute inset-x-0 top-0 h-0.5 bg-nz-gold/70" aria-hidden />
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <Icon className="size-[18px]" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
