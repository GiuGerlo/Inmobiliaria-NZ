import { useMemo, useState } from 'react';
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
import { ReceiptFilters } from './ReceiptFilters';
import { useReceipts, useDeleteReceipt } from './queries';
import {
  emptyReceiptFilters,
  type Receipt,
  type ReceiptFilters as Filters,
  type ReceiptListParams,
} from './types';

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

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Receipt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Receipt | null>(null);

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
        onEdit: (receipt) => {
          setEditing(receipt);
          setFormOpen(true);
        },
        onDelete: (receipt) => setDeleteTarget(receipt),
      }),
    [],
  );

  function openCreate() {
    setEditing(null);
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
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nuevo recibo
              </Button>
            }
          />
        }
      />

      <ReceiptFormDialog open={formOpen} onOpenChange={setFormOpen} receipt={editing} />

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
