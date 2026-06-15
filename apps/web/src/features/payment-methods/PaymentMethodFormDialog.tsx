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
import { Button } from '@/components/ui/button';
import { isValidationError, errorMessage } from '@/lib/api-error';
import { useCreatePaymentMethod, useUpdatePaymentMethod } from './queries';
import { paymentMethodSchema, type PaymentMethodFormValues } from './schema';
import type { PaymentMethod } from './types';

type PaymentMethodFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: PaymentMethod | null;
};

export function PaymentMethodFormDialog({
  open,
  onOpenChange,
  paymentMethod,
}: PaymentMethodFormDialogProps) {
  const isEdit = !!paymentMethod;
  const createPaymentMethod = useCreatePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const isPending = createPaymentMethod.isPending || updatePaymentMethod.isPending;

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { description: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ description: paymentMethod?.description ?? '' });
    }
  }, [open, paymentMethod, form]);

  function applyServerErrors(error: unknown): boolean {
    if (!isValidationError(error)) return false;
    const errors = error.response!.data.errors;
    if (errors.description) {
      form.setError('description', { message: errors.description[0] });
    }
    return true;
  }

  function onSubmit(values: PaymentMethodFormValues) {
    const onError = (error: unknown) => {
      if (!applyServerErrors(error)) {
        toast.error(errorMessage(error, 'No pudimos guardar la forma de pago.'));
      }
    };
    const onSuccess = (message: string) => {
      toast.success(message);
      onOpenChange(false);
    };

    if (isEdit) {
      updatePaymentMethod.mutate(
        { id: paymentMethod.id, input: values },
        { onSuccess: () => onSuccess('Forma de pago actualizada.'), onError },
      );
    } else {
      createPaymentMethod.mutate(values, {
        onSuccess: () => onSuccess('Forma de pago creada.'),
        onError,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar forma de pago' : 'Nueva forma de pago'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modificá la descripción.' : 'Cargá una nueva forma de pago.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Efectivo, Transferencia…" {...field} />
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
