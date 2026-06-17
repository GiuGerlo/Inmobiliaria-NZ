import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { errorMessage } from '@/lib/api-error';
import { buildReceiptColumns } from './columns';
import { ReceiptFormDialog } from './ReceiptFormDialog';
import { ReceiptDetailDialog } from './ReceiptDetailDialog';
import { SendWhatsAppDialog } from './SendWhatsAppDialog';
import { ReceiptFilters } from './ReceiptFilters';
import { MonthlyReportButton } from './MonthlyReportButton';
import { MonthlyReceiptsCard } from './MonthlyReceiptsCard';
import { useReceipts, useDeleteReceipt } from './queries';
import {
  emptyReceiptFilters,
  type Receipt,
  type ReceiptFilters as Filters,
  type ReceiptListParams,
  type WhatsAppType,
} from './types';
import type { Contract } from '@/features/contracts/types';
import { useDashboard } from '@/features/dashboard/queries';
import { PendingReceiptsCard } from '@/features/dashboard/PendingReceiptsCard';

/** Estado de navegación: crear recibo de un contrato (dashboard) o abrir el form vacío (acceso rápido). */
type ReceiptsLocationState = { createForContract?: Contract; openCreate?: boolean };

function toSortParam(sorting: SortingState): string | undefined {
  const sort = sorting[0];
  if (!sort) return undefined;
  return sort.desc ? `-${sort.id}` : sort.id;
}

export function ReceiptsPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  // Sin sort inicial → el backend ordena por más reciente (default -number).
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Filters>(emptyReceiptFilters);

  // Navegación entrante: crear recibo de un contrato (dashboard) o abrir el form vacío (acceso rápido).
  const location = useLocation();
  const navigate = useNavigate();
  const incomingState = location.state as ReceiptsLocationState | null;
  const incomingContract = incomingState?.createForContract ?? null;
  const incomingOpenCreate = incomingState?.openCreate ?? false;

  const [formOpen, setFormOpen] = useState(!!incomingContract || incomingOpenCreate);
  const [editing, setEditing] = useState<Receipt | null>(null);
  const [defaultContract, setDefaultContract] = useState<Contract | null>(incomingContract);
  const [deleteTarget, setDeleteTarget] = useState<Receipt | null>(null);
  const [detailTarget, setDetailTarget] = useState<Receipt | null>(null);
  const [whatsappTarget, setWhatsappTarget] = useState<{ receipt: Receipt; type: WhatsAppType } | null>(null);

  // Consumir el state de navegación para que volver atrás no reabra el form.
  useEffect(() => {
    if (incomingContract || incomingOpenCreate) navigate('.', { replace: true, state: null });
  }, [incomingContract, incomingOpenCreate, navigate]);

  // Pendientes del mes (mismo dataset que el dashboard) para el panel inferior.
  const { data: dashboard } = useDashboard();

  function createReceiptInline(contract: Contract) {
    setEditing(null);
    setDefaultContract(contract);
    setFormOpen(true);
  }

  function handleFiltersChange(next: Filters) {
    setFilters(next);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: ReceiptListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sort: toSortParam(sorting),
    contractId: filters.contractId ?? undefined,
    paymentMethodId: filters.paymentMethodId ?? undefined,
    month: filters.month === 'all' ? undefined : filters.month,
    year: filters.year ? Number(filters.year) : undefined,
  };

  const { data, isLoading, isFetching } = useReceipts(params);
  const deleteReceipt = useDeleteReceipt();

  const columns = useMemo(
    () =>
      buildReceiptColumns({
        onDetail: (receipt) => setDetailTarget(receipt),
        onEdit: (receipt) => {
          setEditing(receipt);
          setFormOpen(true);
        },
        onDelete: (receipt) => setDeleteTarget(receipt),
        onSendWhatsApp: (receipt, type) => setWhatsappTarget({ receipt, type }),
      }),
    [],
  );

  function openCreate() {
    setEditing(null);
    setDefaultContract(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteReceipt.mutate(deleteTarget.number, {
      onSuccess: () => {
        toast.success('Recibo eliminado.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No pudimos eliminar el recibo.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recibos</h1>
          <p className="text-sm text-muted-foreground">Recibos de pago emitidos por contrato.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.meta.last_page ?? 0}
        total={data?.meta.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading || isFetching}
        emptyMessage="No hay recibos cargados."
        toolbar={
          <DataTableToolbar
            filters={<ReceiptFilters filters={filters} onChange={handleFiltersChange} />}
            actions={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <MonthlyReportButton />
                <Button onClick={openCreate}>
                  <Plus className="size-4" />
                  Nuevo recibo
                </Button>
              </div>
            }
          />
        }
      />

      {/* Estado del mes: qué falta emitir y qué ya se emitió. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PendingReceiptsCard
          contracts={dashboard?.pending_receipts ?? []}
          onCreate={createReceiptInline}
        />
        <MonthlyReceiptsCard onSelect={(receipt) => setDetailTarget(receipt)} />
      </div>

      <ReceiptFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        receipt={editing}
        defaultContract={defaultContract}
      />

      <ReceiptDetailDialog
        open={!!detailTarget}
        onOpenChange={(open) => !open && setDetailTarget(null)}
        receipt={detailTarget}
        onEdit={(receipt) => {
          setEditing(receipt);
          setFormOpen(true);
        }}
        onDelete={(receipt) => setDeleteTarget(receipt)}
      />

      <SendWhatsAppDialog
        key={whatsappTarget ? `${whatsappTarget.receipt.number}-${whatsappTarget.type}` : 'none'}
        open={!!whatsappTarget}
        onOpenChange={(open) => !open && setWhatsappTarget(null)}
        receipt={whatsappTarget?.receipt ?? null}
        type={whatsappTarget?.type ?? 'recibo'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar recibo"
        description={
          deleteTarget
            ? `¿Eliminar el recibo #${deleteTarget.number}? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteReceipt.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
