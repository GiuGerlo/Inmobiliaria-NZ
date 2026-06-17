import { CalendarCheck, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import type { ExpiringContract } from './types';

/** Clases del badge según urgencia: rojo <30d, ámbar <60d, neutro el resto. */
function urgencyClasses(daysLeft: number): string {
  if (daysLeft < 30) return 'bg-destructive/10 text-destructive';
  if (daysLeft < 60) return 'bg-amber-100 text-amber-700';
  return 'bg-muted text-muted-foreground';
}

function daysLabel(daysLeft: number): string {
  if (daysLeft <= 0) return 'vence hoy';
  if (daysLeft === 1) return 'en 1 día';
  return `en ${daysLeft} días`;
}

export function ExpiringContractsCard({ items }: { items: ExpiringContract[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" />
          <div>
            <CardTitle className="text-base">Contratos por vencer</CardTitle>
            <p className="text-xs text-muted-foreground">Próximos 90 días</p>
          </div>
        </div>
        {items.length > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {items.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-h-[22rem] overflow-y-auto">
            <Table>
              <TableBody>
                {items.map(({ contract, days_left }) => (
                  <TableRow key={contract.id}>
                    <TableCell className="py-3">
                      <p className="font-medium leading-tight">
                        {contract.owner?.name ?? 'Dueño'}
                        <span className="text-muted-foreground"> · </span>
                        {contract.tenant?.name ?? 'Inquilino'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Vence el {formatDate(contract.end_date)}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums',
                          urgencyClasses(days_left),
                        )}
                      >
                        {daysLabel(days_left)}
                      </span>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <CalendarCheck className="size-8 text-emerald-500" />
      <p className="text-sm font-medium">Sin contratos por vencer</p>
      <p className="text-xs text-muted-foreground">Ningún contrato vence en los próximos 90 días.</p>
    </div>
  );
}
