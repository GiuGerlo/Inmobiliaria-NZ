import { Building2, CalendarDays, CreditCard, FileText, FileSpreadsheet, MapPin, Pencil, Trash2, User, UserSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/format';
import { openReceiptPdf, openSettlementPdf } from './pdf';
import type { Receipt } from './types';

type ReceiptDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
  onEdit: (receipt: Receipt) => void;
  onDelete: (receipt: Receipt) => void;
};

/** Cargos que suman al total del recibo (alquiler + servicios + honorarios). */
const CHARGES: Array<{ key: keyof Receipt; label: string }> = [
  { key: 'property_amount', label: 'Alquiler' },
  { key: 'municipal_amount', label: 'Municipal' },
  { key: 'water_amount', label: 'Agua' },
  { key: 'electricity_amount', label: 'Electricidad' },
  { key: 'gas_amount', label: 'Gas' },
  { key: 'fees_amount', label: 'Honorarios' },
];

/** Conceptos que NO integran el total del recibo (impactan en la rendición al dueño). */
const EXTRAS: Array<{ key: keyof Receipt; label: string }> = [
  { key: 'repairs_amount', label: 'Arreglos' },
  { key: 'funeral_amount', label: 'Otros' },
];

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-[#13294b]/5 text-[#13294b]">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function AmountRow({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className={muted ? 'text-muted-foreground' : 'text-foreground'}>{label}</span>
      <span className="font-medium tabular-nums text-foreground">{formatCurrency(value)}</span>
    </div>
  );
}

export function ReceiptDetailDialog({
  open,
  onOpenChange,
  receipt,
  onEdit,
  onDelete,
}: ReceiptDetailDialogProps) {
  if (!receipt) return null;

  const owner = receipt.contract?.owner?.name ?? '—';
  const tenant = receipt.contract?.tenant?.name ?? '—';
  const address = receipt.contract?.property?.address ?? '—';
  const paymentMethod = receipt.payment_method?.description ?? '—';

  const total =
    receipt.property_amount +
    receipt.municipal_amount +
    receipt.water_amount +
    receipt.electricity_amount +
    receipt.gas_amount +
    receipt.fees_amount;

  // Solo mostramos los conceptos con monto > 0 (los que están en 0 no aparecen).
  const charges = CHARGES.filter(({ key }) => (receipt[key] as number) > 0);
  const extras = EXTRAS.filter(({ key }) => (receipt[key] as number) > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:opacity-80 [&_[data-slot=dialog-close]]:hover:opacity-100">
        {/* Cabecera navy con el total destacado en dorado */}
        <DialogHeader className="space-y-0 bg-[#13294b] px-9 py-5 text-left text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold text-white">
                Recibo
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-sm font-medium text-[#e7c98a]">
                  #{receipt.number}
                </span>
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-sm text-white/70">
                {owner} · {tenant}
              </DialogDescription>
              <div className="mt-1 text-xs text-white/55">
                {receipt.month} {receipt.year}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[11px] font-medium uppercase tracking-wider text-white/55">Total</div>
              <div className="text-2xl font-bold tabular-nums text-[#e7c98a]">{formatCurrency(total)}</div>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {/* Datos del contrato y del pago */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem icon={UserSquare} label="Dueño" value={owner} />
            <InfoItem icon={User} label="Inquilino" value={tenant} />
            <InfoItem icon={MapPin} label="Propiedad" value={address} />
            <InfoItem icon={CreditCard} label="Forma de pago" value={paymentMethod} />
            <InfoItem icon={CalendarDays} label="Fecha de pago" value={formatDate(receipt.paid_at)} />
            <InfoItem icon={Building2} label="Período" value={`${receipt.month} ${receipt.year}`} />
          </div>

          {/* Desglose de cargos del recibo */}
          <div className="mt-6">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cargos del recibo
            </div>
            <div className="divide-y divide-border rounded-lg border bg-card px-4">
              {charges.map(({ key, label }) => (
                <AmountRow key={key} label={label} value={receipt[key] as number} />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-[#13294b]/5 px-4 py-2.5">
              <span className="text-sm font-semibold text-[#13294b]">Total del recibo</span>
              <span className="text-base font-bold tabular-nums text-[#13294b]">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Conceptos que no integran el total (van a la rendición) */}
          {extras.length > 0 && (
            <div className="mt-5">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Otros conceptos <span className="font-normal normal-case">(no suman al total — impactan la rendición)</span>
              </div>
              <div className="divide-y divide-border rounded-lg border bg-card px-4">
                {extras.map(({ key, label }) => (
                  <AmountRow key={key} label={label} value={receipt[key] as number} muted />
                ))}
              </div>
            </div>
          )}

          {/* Comentarios */}
          {receipt.comments && (
            <div className="mt-5">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Comentarios
              </div>
              <p className="rounded-lg border-l-2 border-[#c5a572] bg-[#f4f1ea] px-4 py-3 text-sm text-foreground/90">
                {receipt.comments}
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 border-t bg-muted/30 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onEdit(receipt);
                onOpenChange(false);
              }}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                onDelete(receipt);
                onOpenChange(false);
              }}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openReceiptPdf(receipt.number)}>
              <FileText className="size-4" />
              Recibo PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => openSettlementPdf(receipt.number)}>
              <FileSpreadsheet className="size-4" />
              Rendición PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
