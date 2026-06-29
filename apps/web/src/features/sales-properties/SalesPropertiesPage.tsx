import { useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from '@/lib/toast';
import { Plus, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { errorMessage } from '@/lib/api-error';
import { buildSalePropertyColumns } from './columns';
import { SalePropertyFormDialog } from './SalePropertyFormDialog';
import { SalePropertyGalleryDialog } from './SalePropertyGalleryDialog';
import { PropertyTypesDialog } from './PropertyTypesDialog';
import { useDeleteSaleProperty, usePropertyTypes, useSaleProperties } from './queries';
import type { SaleProperty, SalePropertyListParams } from './types';

function toSortParam(sorting: SortingState): string | undefined {
  const sort = sorting[0];
  if (!sort) return undefined;
  return sort.desc ? `-${sort.id}` : sort.id;
}

const ALL = 'all';

export function SalesPropertiesPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [soldFilter, setSoldFilter] = useState<string>(ALL);

  const [formOpen, setFormOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);
  const [editing, setEditing] = useState<SaleProperty | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SaleProperty | null>(null);
  const [galleryTarget, setGalleryTarget] = useState<SaleProperty | null>(null);

  const { data: types = [] } = usePropertyTypes();

  function resetPage() {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  const params: SalePropertyListParams = {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    // Default: más reciente primero (-id). El orden curado por sort_order lo usa el sitio público.
    sort: toSortParam(sorting) ?? '-id',
    q: debouncedSearch || undefined,
    type: typeFilter === ALL ? undefined : Number(typeFilter),
    sold: soldFilter === ALL ? undefined : soldFilter === 'sold',
  };

  const { data, isLoading, isFetching } = useSaleProperties(params);
  const deleteSaleProperty = useDeleteSaleProperty();

  const columns = useMemo(
    () =>
      buildSalePropertyColumns({
        onView: (property) => setGalleryTarget(property),
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
    deleteSaleProperty.mutate(deleteTarget.id, {
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
          <h1 className="text-2xl font-semibold tracking-tight">Propiedades en venta</h1>
          <p className="text-sm text-muted-foreground">Catálogo de propiedades en venta y sus fotos.</p>
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
        emptyMessage="No hay propiedades en venta."
        toolbar={
          <DataTableToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              resetPage();
            }}
            searchPlaceholder="Buscar por título o localidad…"
            filters={
              <>
                <Select
                  value={typeFilter}
                  onValueChange={(v) => {
                    setTypeFilter(v);
                    resetPage();
                  }}
                >
                  <SelectTrigger className="w-[180px]" aria-label="Filtrar por categoría">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Todas las categorías</SelectItem>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={soldFilter}
                  onValueChange={(v) => {
                    setSoldFilter(v);
                    resetPage();
                  }}
                >
                  <SelectTrigger className="w-[150px]" aria-label="Filtrar por estado">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Todas</SelectItem>
                    <SelectItem value="available">Disponibles</SelectItem>
                    <SelectItem value="sold">Vendidas</SelectItem>
                  </SelectContent>
                </Select>
              </>
            }
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTypesOpen(true)}>
                  <Tags className="size-4" />
                  Categorías
                </Button>
                <Button onClick={openCreate}>
                  <Plus className="size-4" />
                  Nueva propiedad
                </Button>
              </div>
            }
          />
        }
      />

      <SalePropertyFormDialog open={formOpen} onOpenChange={setFormOpen} property={editing} />
      <SalePropertyGalleryDialog
        open={!!galleryTarget}
        onOpenChange={(open) => !open && setGalleryTarget(null)}
        property={galleryTarget}
      />
      <PropertyTypesDialog open={typesOpen} onOpenChange={setTypesOpen} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar propiedad"
        description={
          deleteTarget
            ? `¿Eliminar "${deleteTarget.title ?? 'esta propiedad'}"? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteSaleProperty.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
