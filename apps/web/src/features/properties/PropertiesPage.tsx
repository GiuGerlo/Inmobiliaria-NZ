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
import { useOpenCreateFromState } from '@/lib/use-open-create-from-state';
import { buildPropertyColumns } from './columns';
import { PropertyFormDialog } from './PropertyFormDialog';
import { useProperties, useDeleteProperty } from './queries';
import type { Property, PropertyListParams } from './types';

function toSortParam(sorting: SortingState): string | undefined {
  const sort = sorting[0];
  if (!sort) return undefined;
  return sort.desc ? `-${sort.id}` : sort.id;
}

export function PropertiesPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  // Sin sort inicial → el backend ordena por más reciente (default -id).
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const [formOpen, setFormOpen] = useState(useOpenCreateFromState());
  const [editing, setEditing] = useState<Property | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: PropertyListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sort: toSortParam(sorting),
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetching } = useProperties(params);
  const deleteProperty = useDeleteProperty();

  const columns = useMemo(
    () =>
      buildPropertyColumns({
        onEdit: (property) => {
          setEditing(property);
          setFormOpen(true);
        },
        onDelete: (property) => setDeleteTarget(property),
      }),
    [],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteProperty.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Propiedad eliminada.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No pudimos eliminar la propiedad.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Propiedades</h1>
          <p className="text-sm text-muted-foreground">Inmuebles administrados y sus datos.</p>
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
        emptyMessage="No hay propiedades cargadas."
        toolbar={
          <DataTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar por dirección o características…"
            actions={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nueva propiedad
              </Button>
            }
          />
        }
      />

      <PropertyFormDialog open={formOpen} onOpenChange={setFormOpen} property={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar propiedad"
        description={
          deleteTarget
            ? `¿Eliminar "${deleteTarget.address}"? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteProperty.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
