import { useNavigate } from 'react-router';
import { CheckCircle2, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import type { Contract } from '@/features/contracts/types';

export function BalanceContractsCard({ contracts }: { contracts: Contract[] }) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <Wallet className="size-4 text-primary" />
          <CardTitle className="text-base">Contratos con saldo pendiente</CardTitle>
        </div>
        {contracts.length > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {contracts.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="text-sm font-medium">Sin saldos pendientes</p>
          </div>
        ) : (
          <div className="max-h-[22rem] overflow-y-auto">
            <Table>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer"
                    onClick={() => navigate('/contratos')}
                  >
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
                    <TableCell className="py-3 text-right font-semibold tabular-nums text-destructive">
                      {formatCurrency(contract.balance)}
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
