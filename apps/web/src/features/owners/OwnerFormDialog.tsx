import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EntityCombobox } from '@/components/form/EntityCombobox';
import { fetchCityOptions } from '@/features/cities/api';
import { isValidationError, errorMessage } from '@/lib/api-error';
import { useCreateOwner, useUpdateOwner } from './queries';
import { ownerSchema, type OwnerFormValues } from './schema';
import type { Owner } from './types';

type OwnerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: Owner | null;
};

const FIELDS: Array<keyof OwnerFormValues> = ['name', 'phone', 'email', 'city_code'];

export function OwnerFormDialog({ open, onOpenChange, owner }: OwnerFormDialogProps) {
  const isEdit = !!owner;
  const createOwner = useCreateOwner();
  const updateOwner = useUpdateOwner();
  const isPending = createOwner.isPending || updateOwner.isPending;

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { name: '', phone: '', email: '', city_code: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: owner?.name ?? '',
        phone: owner?.phone ?? '',
        email: owner?.email ?? '',
        city_code: owner?.city_code ?? '',
      });
    }
  }, [open, owner, form]);

  function applyServerErrors(error: unknown): boolean {
    if (!isValidationError(error)) return false;
    const errors = error.response!.data.errors;
    for (const [field, messages] of Object.entries(errors)) {
      if ((FIELDS as string[]).includes(field)) {
        form.setError(field as keyof OwnerFormValues, { message: messages[0] });
      }
    }
    return true;
  }

  function onSubmit(values: OwnerFormValues) {
    const onError = (error: unknown) => {
      if (!applyServerErrors(error)) {
        toast.error(errorMessage(error, 'No pudimos guardar el dueño.'));
      }
    };
    const onSuccess = (message: string) => {
      toast.success(message);
      onOpenChange(false);
    };

    if (isEdit) {
      updateOwner.mutate(
        { id: owner.id, input: values },
        { onSuccess: () => onSuccess('Dueño actualizado.'), onError },
      );
    } else {
      createOwner.mutate(values, { onSuccess: () => onSuccess('Dueño creado.'), onError });
    }
  }

  const initialCityLabel = owner?.city
    ? `${owner.city.name} — ${owner.city.province}`
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar dueño' : 'Nuevo dueño'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modificá los datos del dueño.' : 'Cargá un nuevo dueño.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre y apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="341 555-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city_code"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="owner-city">Ciudad</Label>
                  <EntityCombobox
                    id="owner-city"
                    name="cities"
                    value={field.value || null}
                    onChange={(v) => field.onChange(v ?? '')}
                    fetchOptions={fetchCityOptions}
                    initialLabel={initialCityLabel}
                    placeholder="Elegí una ciudad"
                    searchPlaceholder="Buscar ciudad…"
                    emptyMessage="No se encontraron ciudades."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
