import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import type { City } from './types';

type CityActions = {
  onEdit: (city: City) => void;
  onDelete: (city: City) => void;
};

export function buildCityColumns({ onEdit, onDelete }: CityActions): ColumnDef<City>[] {
  return [
    {
      id: 'code',
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Código postal" />,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ciudad" />,
    },
    {
      id: 'province',
      accessorKey: 'province',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Provincia" />,
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const city = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Acciones de ${city.name}`}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(city)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(city)}>
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
