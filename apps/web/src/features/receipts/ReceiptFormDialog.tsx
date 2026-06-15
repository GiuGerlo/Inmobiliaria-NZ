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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityCombobox } from '@/components/form/EntityCombobox';
import { fetchContractOptions } from '@/features/contracts/api';
import { fetchPaymentMethodOptions } from '@/features/payment-methods/api';
import { isValidationError, errorMessage } from '@/lib/api-error';
import { useCreateReceipt, useUpdateReceipt } from './queries';
import { MONTHS, receiptSchema, type ReceiptFormValues } from './schema';
import type { Receipt } from './types';

/** Los 8 montos del recibo, en el orden en que se muestran. */
const AMOUNT_FIELDS = [
  { name: 'property_amount', label: 'Propiedad' },
  { name: 'municipal_amount', label: 'Municipal' },
  { name: 'water_amount', label: 'Agua' },
  { name: 'electricity_amount', label: 'Electricidad' },
  { name: 'gas_amount', label: 'Gas' },
  { name: 'repairs_amount', label: 'Arreglos' },
  { name: 'funeral_amount', label: 'Otros' },
  { name: 'fees_amount', label: 'Honorarios' },
] as const;

const FIELDS: Array<keyof ReceiptFormValues> = [
  'contract_id',
  'payment_method_id',
  'paid_at',
  ...AMOUNT_FIELDS.map((f) => f.name),
  'month',
  'year',
  'comments',
];

type ReceiptFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
};

export function ReceiptFormDialog({ open, onOpenChange, receipt }: ReceiptFormDialogProps) {
  const isEdit = !!receipt;
  const createReceipt = useCreateReceipt();
  const updateReceipt = useUpdateReceipt();
  const isPending = createReceipt.isPending || updateReceipt.isPending;

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      contract_id: undefined,
      payment_method_id: undefined,
      paid_at: '',
      property_amount: undefined,
      municipal_amount: undefined,
      water_amount: undefined,
      electricity_amount: undefined,
      gas_amount: undefined,
      repairs_amount: undefined,
      funeral_amount: undefined,
      fees_amount: undefined,
      month: undefined,
      year: undefined,
      comments: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      contract_id: receipt?.contract_id ?? undefined,
      payment_method_id: receipt?.payment_method_id ?? undefined,
      paid_at: receipt?.paid_at ?? '',
      property_amount: receipt?.property_amount ?? undefined,
      municipal_amount: receipt?.municipal_amount ?? undefined,
      water_amount: receipt?.water_amount ?? undefined,
      electricity_amount: receipt?.electricity_amount ?? undefined,
      gas_amount: receipt?.gas_amount ?? undefined,
      repairs_amount: receipt?.repairs_amount ?? undefined,
      funeral_amount: receipt?.funeral_amount ?? undefined,
      fees_amount: receipt?.fees_amount ?? undefined,
      month: receipt?.month ?? undefined,
      year: receipt?.year ?? undefined,
      comments: receipt?.comments ?? '',
    });
  }, [open, receipt, form]);

  function applyServerErrors(error: unknown): boolean {
    if (!isValidationError(error)) return false;
    const errors = error.response!.data.errors;
    let handled = false;
    for (const [field, messages] of Object.entries(errors)) {
      if ((FIELDS as string[]).includes(field)) {
        form.setError(field as keyof ReceiptFormValues, { message: messages[0] });
        handled = true;
      }
    }
    return handled;
  }

  function onSubmit(values: ReceiptFormValues) {
    const onError = (error: unknown) => {
      if (!applyServerErrors(error)) {
        toast.error(errorMessage(error, 'No pudimos guardar el recibo.'));
      }
    };
    const onSuccess = (message: string) => {
      toast.success(message);
      onOpenChange(false);
    };

    if (isEdit) {
      updateReceipt.mutate(
        { number: receipt.number, input: values },
        { onSuccess: () => onSuccess('Recibo actualizado.'), onError },
      );
    } else {
      createReceipt.mutate(values, { onSuccess: () => onSuccess('Recibo creado.'), onError });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar recibo' : 'Nuevo recibo'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modificá los datos del recibo.' : 'Cargá un nuevo recibo de pago.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="contract_id"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="receipt-contract">Contrato</Label>
                  <EntityCombobox
                    id="receipt-contract"
                    name="contracts"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? undefined)}
                    fetchOptions={fetchContractOptions}
                    initialLabel={
                      receipt?.contract
                        ? `${receipt.contract.owner?.name ?? 'Dueño'} - ${receipt.contract.tenant?.name ?? 'Inquilino'}`
                        : undefined
                    }
                    placeholder="Elegí un contrato"
                    searchPlaceholder="Buscar contrato…"
                    emptyMessage="No se encontraron contratos."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_method_id"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="receipt-payment-method">Forma de pago</Label>
                  <EntityCombobox
                    id="receipt-payment-method"
                    name="payment-methods"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? undefined)}
                    fetchOptions={fetchPaymentMethodOptions}
                    initialLabel={receipt?.payment_method?.description}
                    placeholder="Elegí una forma de pago"
                    searchPlaceholder="Buscar forma de pago…"
                    emptyMessage="No se encontraron formas de pago."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paid_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de pago</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {AMOUNT_FIELDS.map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {label}
                        {name !== 'property_amount' && (
                          <span className="text-muted-foreground"> (opcional)</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={Number.isFinite(field.value) ? (field.value as number) : ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : e.target.valueAsNumber,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mes</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Elegí…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2000}
                        max={2100}
                        placeholder="2026"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={Number.isFinite(field.value) ? (field.value as number) : ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={200}
                      placeholder="Notas del recibo…"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
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
