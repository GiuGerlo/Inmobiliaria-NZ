import { useNavigate } from 'react-router';
import { FileBarChart, FileText, Home, Receipt, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MONTHS } from '@/features/receipts/schema';
import { openMonthlyReport } from '@/features/receipts/pdf';

type Action = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

export function QuickActions() {
  const navigate = useNavigate();

  // Navega a la página del recurso y abre su form de alta vía location.state.
  const openCreate = (path: string) => () => navigate(path, { state: { openCreate: true } });

  const actions: Action[] = [
    { label: 'Nuevo recibo', icon: Receipt, onClick: openCreate('/recibos') },
    { label: 'Nuevo contrato', icon: FileText, onClick: openCreate('/contratos') },
    { label: 'Nueva propiedad', icon: Home, onClick: openCreate('/propiedades') },
    {
      label: 'Reporte mensual',
      icon: FileBarChart,
      onClick: () => openMonthlyReport(MONTHS[new Date().getMonth()], new Date().getFullYear()),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.label}
            role="button"
            tabIndex={0}
            onClick={action.onClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                action.onClick();
              }
            }}
            className="group flex cursor-pointer flex-row items-center gap-3 p-4 transition-all duration-200 hover:border-nz-gold/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors group-hover:bg-nz-gold group-hover:text-[#1a1a1a]">
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-medium leading-tight">{action.label}</span>
          </Card>
        );
      })}
    </div>
  );
}
