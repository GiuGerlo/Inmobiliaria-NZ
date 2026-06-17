import { CheckCircle2, Plus, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { Contract } from '@/features/contracts/types';

type PendingReceiptsCardProps = {
  contracts: Contract[];
  onCreate: (contract: Contract) => void;
};

export function PendingReceiptsCard({ contracts, onCreate }: PendingReceiptsCardProps) {
  return (
    <Card className="overflow-hidden border-l-2 border-l-nz-gold">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-nz-gold" />
          <CardTitle className="text-base">Recibos pendientes del mes</CardTitle>
        </div>
        {contracts.length > 0 && (
          <Badge className="bg-nz-gold/15 text-nz-gold tabular-nums">{contracts.length}</Badge>
        )}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {contracts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-h-[22rem] overflow-y-auto">
            <Table>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id} className="group">
                    <TableCell className="py-3">
                      <p className="font-medium leading-tight">
                        {contract.owner?.name ?? 'Dueño'}
                        <span className="text-muted-foreground"> · </span>
                        {contract.tenant?.name ?? 'Inquilino'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {contract.property?.address ?? '—'}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary opacity-70 transition-opacity group-hover:opacity-100"
                        onClick={() => onCreate(contract)}
                      >
                        <Plus className="size-4" />
                        Crear recibo
                      </Button>
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
      <CheckCircle2 className="size-8 text-emerald-500" />
      <p className="text-sm font-medium">Todos los recibos del mes emitidos</p>
      <p className="text-xs text-muted-foreground">
        No quedan contratos activos sin recibo este mes.
      </p>
    </div>
  );
}
