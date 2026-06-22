import type { ColumnDef } from '@tanstack/react-table';
import { ImageOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import type { SaleProperty } from './types';

type SalePropertyActions = {
  onView: (property: SaleProperty) => void;
  onEdit: (property: SaleProperty) => void;
  onDelete: (property: SaleProperty) => void;
};

export function buildSalePropertyColumns({
  onView,
  onEdit,
  onDelete,
}: SalePropertyActions): ColumnDef<SaleProperty>[] {
  return [
    {
      id: 'cover',
      enableSorting: false,
      header: '',
      cell: ({ row }) => {
        const property = row.original;
        const url = property.images?.[0]?.url;
        const count = property.images?.length ?? 0;
        if (!url) {
          return (
            <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <ImageOff className="size-4" />
            </div>
          );
        }
        return (
          <button
            type="button"
            onClick={() => onView(property)}
            aria-label={`Ver fotos de ${property.title ?? 'propiedad'}`}
            className="relative size-10 overflow-hidden rounded-md border transition-opacity hover:opacity-80"
          >
            <img src={url} alt="" className="size-full object-cover" />
            {count > 1 && (
              <span className="absolute bottom-0 right-0 rounded-tl bg-background/80 px-1 text-[10px] font-medium leading-tight">
                {count}
              </span>
            )}
          </button>
        );
      },
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
      cell: ({ row }) => row.original.title ?? '—',
    },
    {
      id: 'type',
      enableSorting: false,
      header: 'Categoría',
      accessorFn: (row) => row.type?.name ?? '—',
    },
    {
      id: 'locality',
      enableSorting: false,
      header: 'Localidad',
      accessorFn: (row) => row.locality ?? '—',
    },
    {
      id: 'photos',
      enableSorting: false,
      header: 'Fotos',
      accessorFn: (row) => row.images?.length ?? 0,
    },
    {
      id: 'status',
      enableSorting: false,
      header: 'Estado',
      cell: ({ row }) =>
        row.original.is_sold ? (
          <Badge variant="secondary">Vendida</Badge>
        ) : (
          <Badge>Disponible</Badge>
        ),
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const property = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Acciones de ${property.title ?? 'propiedad'}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(property)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(property)}>
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
