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
import { buildCityColumns } from './columns';
import { CityFormDialog } from './CityFormDialog';
import { useCities, useDeleteCity } from './queries';
import type { City, CityListParams } from './types';

function toSortParam(sorting: SortingState): string | undefined {
  const sort = sorting[0];
  if (!sort) return undefined;
  return sort.desc ? `-${sort.id}` : sort.id;
}

export function CitiesPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null);

  // Al tipear en la búsqueda, volvemos a la primera página.
  function handleSearchChange(value: string) {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: CityListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    sort: toSortParam(sorting),
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetching } = useCities(params);
  const deleteCity = useDeleteCity();

  const columns = useMemo(
    () =>
      buildCityColumns({
        onEdit: (city) => {
          setEditingCity(city);
          setFormOpen(true);
        },
        onDelete: (city) => setDeleteTarget(city),
      }),
    [],
  );

  function openCreate() {
    setEditingCity(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteCity.mutate(deleteTarget.code, {
      onSuccess: () => {
        toast.success('Ciudad eliminada.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        // 409 = FK RESTRICT: el backend manda un mensaje específico.
        toast.error(errorMessage(error, 'No pudimos eliminar la ciudad.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ciudades</h1>
          <p className="text-sm text-muted-foreground">
            Localidades con su código postal y provincia.
          </p>
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
        emptyMessage="No hay ciudades cargadas."
        toolbar={
          <DataTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar por ciudad o provincia…"
            actions={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nueva ciudad
              </Button>
            }
          />
        }
      />

      <CityFormDialog open={formOpen} onOpenChange={setFormOpen} city={editingCity} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar ciudad"
        description={
          deleteTarget
            ? `¿Eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteCity.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
