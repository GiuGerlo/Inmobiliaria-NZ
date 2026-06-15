import { useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { errorMessage } from '@/lib/api-error';
import { buildContractColumns } from './columns';
import { ContractFormDialog } from './ContractFormDialog';
import { ContractFilters } from './ContractFilters';
import { useContracts, useDeleteContract } from './queries';
import {
  emptyContractFilters,
  type Contract,
  type ContractFilters as Filters,
  type ContractListParams,
} from './types';

function toSortParam(sorting: SortingState): string | undefined {
  const sort = sorting[0];
  if (!sort) return undefined;
  return sort.desc ? `-${sort.id}` : sort.id;
}

export function ContractsPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  // Sin sort inicial → el backend ordena por más reciente (default -id).
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Filters>(emptyContractFilters);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);

  function handleFiltersChange(next: Filters) {
    setFilters(next);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: ContractListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sort: toSortParam(sorting),
    certification: filters.certification === 'all' ? undefined : filters.certification,
    ownerId: filters.ownerId ?? undefined,
    tenantId: filters.tenantId ?? undefined,
    startFrom: filters.startFrom || undefined,
    startTo: filters.startTo || undefined,
  };

  const { data, isLoading, isFetching } = useContracts(params);
  const deleteContract = useDeleteContract();

  const columns = useMemo(
    () =>
      buildContractColumns({
        onEdit: (contract) => {
          setEditing(contract);
          setFormOpen(true);
        },
        onDelete: (contract) => setDeleteTarget(contract),
      }),
    [],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteContract.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Contrato eliminado.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No pudimos eliminar el contrato.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contratos</h1>
          <p className="text-sm text-muted-foreground">Contratos de alquiler vigentes e históricos.</p>
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
        emptyMessage="No hay contratos cargados."
        toolbar={
          <DataTableToolbar
            filters={<ContractFilters filters={filters} onChange={handleFiltersChange} />}
            actions={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nuevo contrato
              </Button>
            }
          />
        }
      />

      <ContractFormDialog open={formOpen} onOpenChange={setFormOpen} contract={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar contrato"
        description={
          deleteTarget
            ? `¿Eliminar el contrato #${deleteTarget.id}? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteContract.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
