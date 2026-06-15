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
import type { Tenant } from './types';

type TenantActions = {
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
};

export function buildTenantColumns({ onEdit, onDelete }: TenantActions): ColumnDef<Tenant>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      enableSorting: false,
      header: 'Teléfono',
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Correo" />,
    },
    {
      id: 'city',
      enableSorting: false,
      header: 'Ciudad',
      accessorFn: (row) => row.city?.name ?? '—',
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Acciones de ${tenant.name}`}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(tenant)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(tenant)}>
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
