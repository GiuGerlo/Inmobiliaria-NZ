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
import { buildTenantColumns } from './columns';
import { TenantFormDialog } from './TenantFormDialog';
import { useTenants, useDeleteTenant } from './queries';
import type { Tenant, TenantListParams } from './types';

function toSortParam(sorting: SortingState): string | undefined {
  const sort = sorting[0];
  if (!sort) return undefined;
  return sort.desc ? `-${sort.id}` : sort.id;
}

export function TenantsPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });
  // Sin sort inicial → el backend ordena por más reciente (default -id).
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: TenantListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sort: toSortParam(sorting),
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetching } = useTenants(params);
  const deleteTenant = useDeleteTenant();

  const columns = useMemo(
    () =>
      buildTenantColumns({
        onEdit: (tenant) => {
          setEditing(tenant);
          setFormOpen(true);
        },
        onDelete: (tenant) => setDeleteTarget(tenant),
      }),
    [],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteTenant.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Inquilino eliminado.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No pudimos eliminar el inquilino.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inquilinos</h1>
          <p className="text-sm text-muted-foreground">Personas que alquilan los inmuebles.</p>
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
        emptyMessage="No hay inquilinos cargados."
        toolbar={
          <DataTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar por nombre o correo…"
            actions={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nuevo inquilino
              </Button>
            }
          />
        }
      />

      <TenantFormDialog open={formOpen} onOpenChange={setFormOpen} tenant={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar inquilino"
        description={
          deleteTarget
            ? `¿Eliminar a "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteTenant.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
