import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PaymentReminderTab } from './PaymentReminderTab';
import { MissingItemsTab } from './MissingItemsTab';
import { MessageHistory } from './MessageHistory';

const TABS = [
  { id: 'pago', label: 'Recordatorio de pago' },
  { id: 'faltantes', label: 'Faltantes' },
  { id: 'historial', label: 'Historial' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function RemindersPage() {
  const [tab, setTab] = useState<TabId>('pago');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recordatorios</h1>
        <p className="text-sm text-muted-foreground">Mensajes de WhatsApp a los inquilinos.</p>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium',
              tab === t.id
                ? 'border-[#13294b] text-[#13294b]'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pago' && <PaymentReminderTab />}
      {tab === 'faltantes' && <MissingItemsTab />}
      {tab === 'historial' && <MessageHistory />}
    </div>
  );
}
