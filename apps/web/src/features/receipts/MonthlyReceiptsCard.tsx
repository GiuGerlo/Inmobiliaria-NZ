import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/format';
import { useReceipts } from './queries';
import { receiptTotal } from './total';
import type { Month } from './schema';
import type { Receipt } from './types';

type MonthlyReceiptsCardProps = {
  month: Month;
  year: number;
  onSelect: (receipt: Receipt) => void;
};

/** Recibos ya emitidos en el mes/año elegido. Lista corta read-only; fila → detalle. */
export function MonthlyReceiptsCard({ month, year, onSelect }: MonthlyReceiptsCardProps) {
  const { data } = useReceipts({ page: 1, perPage: 100, month, year });
  const receipts = data?.data ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="size-4 text-emerald-600" />
          <CardTitle className="text-base">Recibos hechos este mes</CardTitle>
        </div>
        {receipts.length > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {receipts.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <CheckCircle2 className="size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">Todavía no se emitió ningún recibo este mes</p>
          </div>
        ) : (
          <div className="max-h-[22rem] overflow-y-auto">
            <Table>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow
                    key={receipt.number}
                    className="cursor-pointer"
                    onClick={() => onSelect(receipt)}
                  >
                    <TableCell className="py-3">
                      <p className="font-medium leading-tight">
                        {receipt.contract?.owner?.name ?? 'Dueño'}
                        <span className="text-muted-foreground"> · </span>
                        {receipt.contract?.tenant?.name ?? 'Inquilino'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Recibo #{receipt.number} · {formatDate(receipt.paid_at)}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-right font-medium tabular-nums">
                      {formatCurrency(receiptTotal(receipt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
