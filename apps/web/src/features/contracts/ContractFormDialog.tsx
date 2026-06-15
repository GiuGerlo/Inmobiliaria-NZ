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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityCombobox } from '@/components/form/EntityCombobox';
import { fetchOwnerOptions } from '@/features/owners/api';
import { fetchTenantOptions } from '@/features/tenants/api';
import { fetchPropertyOptions } from '@/features/properties/api';
import { isValidationError, errorMessage } from '@/lib/api-error';
import { useCreateContract, useUpdateContract } from './queries';
import { contractSchema, type ContractFormValues } from './schema';
import type { Contract } from './types';

const FIELDS: Array<keyof ContractFormValues> = [
  'owner_id',
  'tenant_id',
  'property_id',
  'start_date',
  'end_date',
  'balance',
  'certification',
];

type ContractFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
};

export function ContractFormDialog({ open, onOpenChange, contract }: ContractFormDialogProps) {
  const isEdit = !!contract;
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const isPending = createContract.isPending || updateContract.isPending;

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      owner_id: undefined,
      tenant_id: undefined,
      property_id: undefined,
      start_date: '',
      end_date: '',
      balance: undefined,
      certification: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      owner_id: contract?.owner_id ?? undefined,
      tenant_id: contract?.tenant_id ?? undefined,
      property_id: contract?.property_id ?? undefined,
      start_date: contract?.start_date ?? '',
      end_date: contract?.end_date ?? '',
      balance: contract?.balance ?? undefined,
      certification: contract?.certification ?? undefined,
    });
  }, [open, contract, form]);

  function applyServerErrors(error: unknown): boolean {
    if (!isValidationError(error)) return false;
    const errors = error.response!.data.errors;
    let handled = false;
    for (const [field, messages] of Object.entries(errors)) {
      if ((FIELDS as string[]).includes(field)) {
        form.setError(field as keyof ContractFormValues, { message: messages[0] });
        handled = true;
      }
    }
    return handled;
  }

  function onSubmit(values: ContractFormValues) {
    const onError = (error: unknown) => {
      if (!applyServerErrors(error)) {
        toast.error(errorMessage(error, 'No pudimos guardar el contrato.'));
      }
    };
    const onSuccess = (message: string) => {
      toast.success(message);
      onOpenChange(false);
    };

    if (isEdit) {
      updateContract.mutate(
        { id: contract.id, input: values },
        { onSuccess: () => onSuccess('Contrato actualizado.'), onError },
      );
    } else {
      createContract.mutate(values, { onSuccess: () => onSuccess('Contrato creado.'), onError });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar contrato' : 'Nuevo contrato'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modificá los datos del contrato.' : 'Cargá un nuevo contrato de alquiler.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="property_id"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="contract-property">Propiedad</Label>
                  <EntityCombobox
                    id="contract-property"
                    name="properties"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? undefined)}
                    fetchOptions={fetchPropertyOptions}
                    initialLabel={contract?.property?.address}
                    placeholder="Elegí una propiedad"
                    searchPlaceholder="Buscar propiedad…"
                    emptyMessage="No se encontraron propiedades."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner_id"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="contract-owner">Dueño</Label>
                  <EntityCombobox
                    id="contract-owner"
                    name="owners"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? undefined)}
                    fetchOptions={fetchOwnerOptions}
                    initialLabel={contract?.owner?.name}
                    placeholder="Elegí un dueño"
                    searchPlaceholder="Buscar dueño…"
                    emptyMessage="No se encontraron dueños."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenant_id"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="contract-tenant">Inquilino</Label>
                  <EntityCombobox
                    id="contract-tenant"
                    name="tenants"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? undefined)}
                    fetchOptions={fetchTenantOptions}
                    initialLabel={contract?.tenant?.name}
                    placeholder="Elegí un inquilino"
                    searchPlaceholder="Buscar inquilino…"
                    emptyMessage="No se encontraron inquilinos."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={Number.isFinite(field.value) ? field.value : ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="certification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificación</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Elegí…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Si">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
