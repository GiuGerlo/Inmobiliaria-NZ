import { STATUS_LABEL, type WhatsAppStatus } from './types';

const STATUS_STYLE: Record<WhatsAppStatus, string> = {
  sent: 'text-slate-700 bg-slate-100',
  delivered: 'text-emerald-700 bg-emerald-50',
  read: 'text-sky-700 bg-sky-50',
  failed: 'text-destructive bg-destructive/10',
  queued: 'text-muted-foreground bg-muted',
};

export function StatusBadge({ status }: { status: WhatsAppStatus }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
