import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, ShieldOff, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import type { AdminUser } from './types';

type UserActions = {
  onEdit: (user: AdminUser) => void;
  onSessions: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
};

export function buildUserColumns({ onEdit, onSessions, onDelete }: UserActions): ColumnDef<AdminUser>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Correo" />,
    },
    {
      id: 'role',
      enableSorting: false,
      header: 'Rol',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Badge variant={user.is_superadmin ? 'default' : 'secondary'}>
            {user.is_superadmin ? 'Superadmin' : 'Inmobiliaria'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Acciones de ${user.name}`}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(user)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSessions(user)}>
                  <ShieldOff className="size-4" />
                  Sesiones
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(user)}>
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
