import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { Image as ImageIcon, ImagePlus, Loader2, Trash2 } from 'lucide-react';
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
import { queryKeys } from '@/lib/query-keys';
import {
  useCreateProperty,
  useUpdateProperty,
  useUploadPropertyPhoto,
  useDeletePropertyPhoto,
} from './queries';
import { propertySchema, type PropertyFormValues } from './schema';
import type { Property } from './types';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const FIELDS: Array<keyof PropertyFormValues> = [
  'address',
  'city_code',
  'type',
  'services',
  'price',
  'features',
];

type PropertyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
};

export function PropertyFormDialog({ open, onOpenChange, property }: PropertyFormDialogProps) {
  const isEdit = !!property;
  const qc = useQueryClient();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const uploadPhoto = useUploadPropertyPhoto();
  const deletePhoto = useDeletePropertyPhoto();
  const isPending =
    createProperty.isPending ||
    updateProperty.isPending ||
    uploadPhoto.isPending ||
    deletePhoto.isPending;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);

  // Preview del archivo elegido; se revoca el object URL al cambiar/desmontar.
  const previewUrl = useMemo(() => (photoFile ? URL.createObjectURL(photoFile) : null), [photoFile]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: { address: '', city_code: '', type: '', services: '', price: undefined, features: '' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      address: property?.address ?? '',
      city_code: property?.city_code ?? '',
      type: property?.type ?? '',
      services: property?.services ?? '',
      price: property?.price ?? undefined,
      features: property?.features ?? '',
    });
    // Sincroniza el estado local de la foto al (re)abrir el diálogo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhotoFile(null);
    setRemoveExisting(false);
  }, [open, property, form]);

  const shownPhoto = previewUrl ?? (!removeExisting ? (property?.photo_url ?? null) : null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('La imagen supera los 5 MB.');
      return;
    }
    setPhotoFile(file);
    setRemoveExisting(false);
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setRemoveExisting(true);
  }

  function applyServerErrors(error: unknown): boolean {
    if (!isValidationError(error)) return false;
    const errors = error.response!.data.errors;
    let handled = false;
    for (const [field, messages] of Object.entries(errors)) {
      if ((FIELDS as string[]).includes(field)) {
        form.setError(field as keyof PropertyFormValues, { message: messages[0] });
        handled = true;
      }
    }
    return handled;
  }

  async function onSubmit(values: PropertyFormValues) {
    let saved: Property;
    try {
      saved = isEdit
        ? await updateProperty.mutateAsync({ id: property.id, input: values })
        : await createProperty.mutateAsync(values);
    } catch (error) {
      if (!applyServerErrors(error)) {
        toast.error(errorMessage(error, 'No pudimos guardar la propiedad.'));
      }
      return;
    }

    // La foto no bloquea el guardado de los datos.
    try {
      if (photoFile) {
        await uploadPhoto.mutateAsync({ id: saved.id, file: photoFile });
      } else if (isEdit && removeExisting && property?.photo_url) {
        await deletePhoto.mutateAsync(saved.id);
      }
    } catch (error) {
      qc.invalidateQueries({ queryKey: queryKeys.properties.all });
      toast.error(errorMessage(error, 'Los datos se guardaron, pero hubo un problema con la foto.'));
      onOpenChange(false);
      return;
    }

    await qc.invalidateQueries({ queryKey: queryKeys.properties.all });
    toast.success(isEdit ? 'Propiedad actualizada.' : 'Propiedad creada.');
    onOpenChange(false);
  }

  const initialCityLabel = property?.city
    ? `${property.city.name} — ${property.city.province}`
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar propiedad' : 'Nueva propiedad'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modificá los datos del inmueble.' : 'Cargá un nuevo inmueble.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. Pellegrini 1234" {...field} />
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
                  <Label htmlFor="property-city">Ciudad</Label>
                  <EntityCombobox
                    id="property-city"
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Input placeholder="Departamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="120000"
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
            </div>
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicios</FormLabel>
                  <FormControl>
                    <Input placeholder="Agua, luz, gas…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Características</FormLabel>
                  <FormControl>
                    <Input placeholder="2 dormitorios, balcón…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Foto</Label>
              <div className="flex items-center justify-center gap-4">
                {shownPhoto ? (
                  <div className="size-20 shrink-0 overflow-hidden rounded-md border">
                    <img src={shownPhoto} alt="Vista previa" className="size-full object-cover" />
                  </div>
                ) : (
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <ImageIcon className="size-6" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="size-4" />
                    {shownPhoto ? 'Cambiar foto' : 'Subir foto'}
                  </Button>
                  {shownPhoto && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemovePhoto}>
                      <Trash2 className="size-4" />
                      Quitar
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">JPG, PNG o WebP · máx 5 MB</p>
                </div>
              </div>
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
