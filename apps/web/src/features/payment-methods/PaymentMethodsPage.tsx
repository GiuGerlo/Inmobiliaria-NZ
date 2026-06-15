import { useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { errorMessage } from '@/lib/api-error';
import { buildPaymentMethodColumns } from './columns';
import { PaymentMethodFormDialog } from './PaymentMethodFormDialog';
import { usePaymentMethods, useDeletePaymentMethod } from './queries';
import type { PaymentMethod, PaymentMethodListParams } from './types';

function toSortParam(sorting: SortingState): string | undefined {
  const sort = sorting[0];
  if (!sort) return undefined;
  return sort.desc ? `-${sort.id}` : sort.id;
}

export function PaymentMethodsPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });
  // Sin sort inicial → el backend ordena por más reciente (default -id).
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: PaymentMethodListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sort: toSortParam(sorting),
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetching } = usePaymentMethods(params);
  const deletePaymentMethod = useDeletePaymentMethod();

  const columns = useMemo(
    () =>
      buildPaymentMethodColumns({
        onEdit: (paymentMethod) => {
          setEditing(paymentMethod);
          setFormOpen(true);
        },
        onDelete: (paymentMethod) => setDeleteTarget(paymentMethod),
      }),
    [],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deletePaymentMethod.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Forma de pago eliminada.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No pudimos eliminar la forma de pago.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Formas de pago</h1>
          <p className="text-sm text-muted-foreground">Medios de cobro disponibles para los recibos.</p>
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
        emptyMessage="No hay formas de pago cargadas."
        toolbar={
          <DataTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar forma de pago…"
            actions={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nueva forma de pago
              </Button>
            }
          />
        }
      />

      <PaymentMethodFormDialog open={formOpen} onOpenChange={setFormOpen} paymentMethod={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar forma de pago"
        description={
          deleteTarget
            ? `¿Eliminar "${deleteTarget.description}"? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deletePaymentMethod.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
