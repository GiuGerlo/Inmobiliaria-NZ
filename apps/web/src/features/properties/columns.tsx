import type { ColumnDef } from '@tanstack/react-table';
import { ImageOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { formatCurrency } from '@/lib/format';
import type { Property } from './types';

type PropertyActions = {
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
};

export function buildPropertyColumns({ onEdit, onDelete }: PropertyActions): ColumnDef<Property>[] {
  return [
    {
      id: 'photo',
      enableSorting: false,
      header: '',
      cell: ({ row }) => {
        const url = row.original.photo_url;
        return url ? (
          <img src={url} alt="" className="size-10 rounded-md object-cover" />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <ImageOff className="size-4" />
          </div>
        );
      },
    },
    {
      id: 'address',
      accessorKey: 'address',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Dirección" />,
    },
    {
      id: 'city',
      enableSorting: false,
      header: 'Ciudad',
      accessorFn: (row) => row.city?.name ?? '—',
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
      cell: ({ row }) => formatCurrency(row.original.price),
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
                <Button variant="ghost" size="icon" aria-label={`Acciones de ${property.address}`}>
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
