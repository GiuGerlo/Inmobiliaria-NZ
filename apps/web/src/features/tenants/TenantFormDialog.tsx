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
import { useCreateTenant, useUpdateTenant } from './queries';
import { tenantSchema, type TenantFormValues } from './schema';
import type { Tenant } from './types';

type TenantFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
};

const FIELDS: Array<keyof TenantFormValues> = ['name', 'phone', 'email', 'city_code'];

export function TenantFormDialog({ open, onOpenChange, tenant }: TenantFormDialogProps) {
  const isEdit = !!tenant;
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const isPending = createTenant.isPending || updateTenant.isPending;

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { name: '', phone: '', email: '', city_code: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: tenant?.name ?? '',
        phone: tenant?.phone ?? '',
        email: tenant?.email ?? '',
        city_code: tenant?.city_code ?? '',
      });
    }
  }, [open, tenant, form]);

  function applyServerErrors(error: unknown): boolean {
    if (!isValidationError(error)) return false;
    const errors = error.response!.data.errors;
    for (const [field, messages] of Object.entries(errors)) {
      if ((FIELDS as string[]).includes(field)) {
        form.setError(field as keyof TenantFormValues, { message: messages[0] });
      }
    }
    return true;
  }

  function onSubmit(values: TenantFormValues) {
    const onError = (error: unknown) => {
      if (!applyServerErrors(error)) {
        toast.error(errorMessage(error, 'No pudimos guardar el inquilino.'));
      }
    };
    const onSuccess = (message: string) => {
      toast.success(message);
      onOpenChange(false);
    };

    if (isEdit) {
      updateTenant.mutate(
        { id: tenant.id, input: values },
        { onSuccess: () => onSuccess('Inquilino actualizado.'), onError },
      );
    } else {
      createTenant.mutate(values, { onSuccess: () => onSuccess('Inquilino creado.'), onError });
    }
  }

  const initialCityLabel = tenant?.city
    ? `${tenant.city.name} — ${tenant.city.province}`
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar inquilino' : 'Nuevo inquilino'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modificá los datos del inquilino.' : 'Cargá un nuevo inquilino.'}
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
                    <Input placeholder="María López" {...field} />
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
                    <Input type="email" placeholder="maria@correo.com" {...field} />
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
                  <Label htmlFor="tenant-city">Ciudad</Label>
                  <EntityCombobox
                    id="tenant-city"
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
