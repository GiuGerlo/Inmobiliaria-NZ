import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { formatDate } from '@/lib/format';
import type { Contract } from './types';

type ContractActions = {
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
};

export function buildContractColumns({ onEdit, onDelete }: ContractActions): ColumnDef<Contract>[] {
  return [
    {
      id: 'property',
      enableSorting: false,
      header: 'Propiedad',
      accessorFn: (row) => row.property?.address ?? '—',
    },
    {
      id: 'tenant',
      enableSorting: false,
      header: 'Inquilino',
      accessorFn: (row) => row.tenant?.name ?? '—',
    },
    {
      id: 'owner',
      enableSorting: false,
      header: 'Dueño',
      accessorFn: (row) => row.owner?.name ?? '—',
    },
    {
      id: 'start_date',
      accessorKey: 'start_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Inicio" />,
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      id: 'end_date',
      accessorKey: 'end_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fin" />,
      cell: ({ row }) => formatDate(row.original.end_date),
    },
    {
      id: 'certification',
      enableSorting: false,
      header: 'Certificación',
      cell: ({ row }) =>
        row.original.certification === 'Si' ? (
          <Badge>Sí</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        ),
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const contract = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Acciones del contrato #${contract.id}`}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(contract)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(contract)}>
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
