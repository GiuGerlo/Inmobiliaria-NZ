import { useNavigate } from 'react-router';
import { Receipt as ReceiptIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/format';
import { receiptTotal } from '@/features/receipts/total';
import type { Receipt } from '@/features/receipts/types';

export function LatestReceiptsCard({ receipts }: { receipts: Receipt[] }) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <ReceiptIcon className="size-4 text-primary" />
        <CardTitle className="text-base">Últimos recibos generados</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {receipts.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            Todavía no hay recibos emitidos.
          </p>
        ) : (
          <Table>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow
                  key={receipt.number}
                  className="cursor-pointer"
                  onClick={() => navigate('/recibos')}
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
        )}
      </CardContent>
    </Card>
  );
}
