import { useEffect, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isValidationError, errorMessage } from '@/lib/api-error';
import { useCreateCity, useUpdateCity } from './queries';
import { citySchema, type CityFormValues } from './schema';
import { ARGENTINE_PROVINCES } from './provinces';
import type { City } from './types';

type CityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = crear, City = editar. */
  city: City | null;
};

const FIELDS: Array<keyof CityFormValues> = ['code', 'name', 'province'];

export function CityFormDialog({ open, onOpenChange, city }: CityFormDialogProps) {
  const isEdit = !!city;
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const isPending = createCity.isPending || updateCity.isPending;

  const form = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: { code: '', name: '', province: '' },
  });

  // Si una ciudad legacy tiene una provincia fuera de la lista canónica,
  // la incluimos igual para no perder el valor al editar.
  const provinceOptions = useMemo(() => {
    const base: string[] = [...ARGENTINE_PROVINCES];
    if (city?.province && !base.includes(city.province)) {
      return [city.province, ...base];
    }
    return base;
  }, [city]);

  // Sincroniza el form al abrir / cambiar de ciudad.
  useEffect(() => {
    if (open) {
      form.reset(city ?? { code: '', name: '', province: '' });
    }
  }, [open, city, form]);

  function applyServerErrors(error: unknown): boolean {
    if (!isValidationError(error)) return false;
    const errors = error.response!.data.errors;
    // El backend usa nombres en inglés (code/name/province) vía MapsLegacyFields.
    for (const [field, messages] of Object.entries(errors)) {
      if ((FIELDS as string[]).includes(field)) {
        form.setError(field as keyof CityFormValues, { message: messages[0] });
      }
    }
    return true;
  }

  function onSubmit(values: CityFormValues) {
    const onError = (error: unknown) => {
      if (!applyServerErrors(error)) {
        toast.error(errorMessage(error, 'No pudimos guardar la ciudad.'));
      }
    };
    const onSuccess = (message: string) => {
      toast.success(message);
      onOpenChange(false);
    };

    if (isEdit) {
      updateCity.mutate(
        { code: city.code, input: values },
        { onSuccess: () => onSuccess('Ciudad actualizada.'), onError },
      );
    } else {
      createCity.mutate(values, {
        onSuccess: () => onSuccess('Ciudad creada.'),
        onError,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar ciudad' : 'Nueva ciudad'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modificá los datos de la ciudad.'
              : 'Cargá una nueva ciudad con su código postal.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código postal</FormLabel>
                  <FormControl>
                    <Input placeholder="2000" disabled={isEdit} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Rosario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Elegí una provincia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {provinceOptions.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
