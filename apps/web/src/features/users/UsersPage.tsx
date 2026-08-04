import { useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from '@/lib/toast';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { errorMessage } from '@/lib/api-error';
import { buildUserColumns } from './columns';
import { UserFormDialog } from './UserFormDialog';
import { UserSessionsDialog } from './UserSessionsDialog';
import { useUsers, useDeleteUser } from './queries';
import type { AdminUser } from './types';

export function UsersPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [sessionTarget, setSessionTarget] = useState<AdminUser | null>(null);

  const { data, isLoading, isFetching } = useUsers(pagination.pageIndex + 1, pagination.pageSize);
  const deleteUser = useDeleteUser();

  const columns = useMemo(
    () =>
      buildUserColumns({
        onEdit: (user) => {
          setEditing(user);
          setFormOpen(true);
        },
        onSessions: (user) => setSessionTarget(user),
        onDelete: (user) => setDeleteTarget(user),
      }),
    [],
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Usuario eliminado.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No pudimos eliminar el usuario.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">Cuentas con acceso al panel de administración.</p>
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
        emptyMessage="No hay usuarios cargados."
        toolbar={
          <DataTableToolbar
            actions={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nuevo usuario
              </Button>
            }
          />
        }
      />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <UserSessionsDialog
        user={sessionTarget}
        open={!!sessionTarget}
        onOpenChange={(open) => !open && setSessionTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar usuario"
        description={
          deleteTarget
            ? `¿Eliminar a "${deleteTarget.name}"? Se cerrarán todas sus sesiones activas. Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={deleteUser.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
