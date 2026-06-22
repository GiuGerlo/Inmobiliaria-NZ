import { useState } from 'react';
import { toast } from '@/lib/toast';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { errorMessage } from '@/lib/api-error';
import {
  useCreatePropertyType,
  useDeletePropertyType,
  usePropertyTypes,
  useUpdatePropertyType,
} from './queries';
import type { PropertyType } from './types';

type PropertyTypesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PropertyTypesDialog({ open, onOpenChange }: PropertyTypesDialogProps) {
  const { data: types = [], isLoading } = usePropertyTypes();
  const createType = useCreatePropertyType();
  const updateType = useUpdatePropertyType();
  const deleteType = useDeletePropertyType();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PropertyType | null>(null);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createType.mutate(name, {
      onSuccess: () => {
        setNewName('');
        toast.success('Categoría creada.');
      },
      onError: (error) => toast.error(errorMessage(error, 'No pudimos crear la categoría.')),
    });
  }

  function handleRename(id: number) {
    const name = editingName.trim();
    if (!name) return;
    updateType.mutate(
      { id, name },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success('Categoría actualizada.');
        },
        onError: (error) => toast.error(errorMessage(error, 'No pudimos renombrar la categoría.')),
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteType.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Categoría eliminada.');
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No se puede eliminar: la categoría tiene propiedades.'));
        setDeleteTarget(null);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorías</DialogTitle>
          <DialogDescription>Gestioná las categorías de propiedades en venta.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nueva categoría"
            aria-label="Nueva categoría"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button type="button" onClick={handleCreate} disabled={createType.isPending}>
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>

        <ul className="divide-y rounded-md border">
          {isLoading && (
            <li className="flex justify-center p-4 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </li>
          )}
          {!isLoading && types.length === 0 && (
            <li className="p-4 text-center text-sm text-muted-foreground">Sin categorías.</li>
          )}
          {types.map((type) => (
            <li key={type.id} className="flex items-center gap-2 p-2">
              {editingId === type.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    aria-label={`Renombrar ${type.name}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(type.id)}
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => handleRename(type.id)}>
                    <Check className="size-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{type.name}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar ${type.name}`}
                    onClick={() => {
                      setEditingId(type.id);
                      setEditingName(type.name);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Eliminar ${type.name}`}
                    onClick={() => setDeleteTarget(type)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          title="Eliminar categoría"
          description={
            deleteTarget ? `¿Eliminar "${deleteTarget.name}"?` : undefined
          }
          confirmLabel="Eliminar"
          destructive
          loading={deleteType.isPending}
          onConfirm={confirmDelete}
        />
      </DialogContent>
    </Dialog>
  );
}
