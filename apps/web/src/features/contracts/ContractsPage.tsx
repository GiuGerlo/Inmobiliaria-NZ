import { useCallback, useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from '@/lib/toast';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { errorCode, errorMessage } from '@/lib/api-error';
import { useOpenCreateFromState } from '@/lib/use-open-create-from-state';
import { buildContractColumns } from './columns';
import { ContractFormDialog } from './ContractFormDialog';
import { ContractFilters } from './ContractFilters';
import { useContracts, useDeleteContract, useSetContractArchived } from './queries';
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
  const [showArchived, setShowArchived] = useState(false);

  const [formOpen, setFormOpen] = useState(useOpenCreateFromState());
  const [editing, setEditing] = useState<Contract | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Contract | null>(null);

  function handleFiltersChange(next: Filters) {
    setFilters(next);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  function handleShowArchived(next: boolean) {
    setShowArchived(next);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: ContractListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    archived: showArchived ? '1' : undefined,
    sort: toSortParam(sorting),
    certification: filters.certification === 'all' ? undefined : filters.certification,
    ownerId: filters.ownerId ?? undefined,
    tenantId: filters.tenantId ?? undefined,
    startFrom: filters.startFrom || undefined,
    startTo: filters.startTo || undefined,
  };

  const { data, isLoading, isFetching } = useContracts(params);
  const deleteContract = useDeleteContract();
  const { mutate: mutateArchived, isPending: archivePending } = useSetContractArchived();

  const changeArchived = useCallback((contract: Contract, archived: boolean) => {
    mutateArchived(
      { id: contract.id, archived },
      {
        onSuccess: () => {
          toast.success(archived ? 'Contrato archivado.' : 'Contrato reactivado.');
          setArchiveTarget(null);
        },
        onError: (error) => {
          toast.error(errorMessage(error, 'No pudimos actualizar el contrato.'));
          setArchiveTarget(null);
        },
      },
    );
  }, [mutateArchived]);

  const columns = useMemo(
    () =>
      buildContractColumns({
        onEdit: (contract) => {
          setEditing(contract);
          setFormOpen(true);
        },
        onDelete: (contract) => setDeleteTarget(contract),
        onArchive: (contract) => setArchiveTarget(contract),
        onUnarchive: (contract) => changeArchived(contract, false),
      }),
    [changeArchived],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    deleteContract.mutate(target.id, {
      onSuccess: () => {
        toast.success('Contrato eliminado.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        setDeleteTarget(null);
        // Con recibos no se puede borrar (es histórico): se ofrece archivar.
        if (errorCode(error) === 'has_receipts') {
          setArchiveTarget(target);
          return;
        }
        toast.error(errorMessage(error, 'No pudimos eliminar el contrato.'));
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contratos</h1>
          <p className="text-sm text-muted-foreground">
            {showArchived
              ? 'Contratos archivados: no aparecen para elegir en ningún lado, pero conservan sus recibos.'
              : 'Contratos de alquiler en uso.'}
          </p>
        </div>
        <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="Ver contratos">
          <Button
            size="sm"
            variant={showArchived ? 'ghost' : 'default'}
            aria-pressed={!showArchived}
            onClick={() => handleShowArchived(false)}
          >
            Vigentes
          </Button>
          <Button
            size="sm"
            variant={showArchived ? 'default' : 'ghost'}
            aria-pressed={showArchived}
            onClick={() => handleShowArchived(true)}
          >
            Archivados
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.meta?.last_page ?? 0}
        total={data?.meta?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading || isFetching}
        emptyMessage={showArchived ? 'No hay contratos archivados.' : 'No hay contratos cargados.'}
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
            ? `¿Eliminar el contrato #${deleteTarget.id}? Solo se puede si no tiene recibos (por ejemplo, si se cargó por error). Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteContract.isPending}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Archivar contrato"
        description={
          archiveTarget
            ? `El contrato #${archiveTarget.id} deja de aparecer en recibos, inicio y recordatorios. Sus recibos se conservan y podés reactivarlo cuando quieras desde "Archivados".`
            : undefined
        }
        confirmLabel="Archivar"
        doubleConfirm={false}
        loading={archivePending}
        onConfirm={() => archiveTarget && changeArchived(archiveTarget, true)}
      />
    </div>
  );
}
