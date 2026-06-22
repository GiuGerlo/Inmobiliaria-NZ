import { useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from '@/lib/toast';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { errorMessage } from '@/lib/api-error';
import { buildOwnerColumns } from './columns';
import { OwnerFormDialog } from './OwnerFormDialog';
import { useOwners, useDeleteOwner } from './queries';
import type { Owner, OwnerListParams } from './types';

function toSortParam(sorting: SortingState): string | undefined {
  const sort = sorting[0];
  if (!sort) return undefined;
  return sort.desc ? `-${sort.id}` : sort.id;
}

export function OwnersPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  // Sin sort inicial → el backend ordena por más reciente (default -id).
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Owner | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: OwnerListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sort: toSortParam(sorting),
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetching } = useOwners(params);
  const deleteOwner = useDeleteOwner();

  const columns = useMemo(
    () =>
      buildOwnerColumns({
        onEdit: (owner) => {
          setEditing(owner);
          setFormOpen(true);
        },
        onDelete: (owner) => setDeleteTarget(owner),
      }),
    [],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteOwner.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Dueño eliminado.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No pudimos eliminar el dueño.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dueños</h1>
          <p className="text-sm text-muted-foreground">Propietarios de los inmuebles administrados.</p>
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
        emptyMessage="No hay dueños cargados."
        toolbar={
          <DataTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar por nombre o correo…"
            actions={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nuevo dueño
              </Button>
            }
          />
        }
      />

      <OwnerFormDialog open={formOpen} onOpenChange={setFormOpen} owner={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar dueño"
        description={
          deleteTarget
            ? `¿Eliminar a "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteOwner.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
