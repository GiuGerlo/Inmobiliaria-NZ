import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { Image as ImageIcon, ImagePlus, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EntityCombobox } from '@/components/form/EntityCombobox';
import { isValidationError, errorMessage } from '@/lib/api-error';
import { queryKeys } from '@/lib/query-keys';
import { fetchPropertyTypeOptions } from './api';
import { DraggableImageGrid } from './DraggableImageGrid';
import {
  useCreateSaleProperty,
  useDeleteImage,
  useReorderImages,
  useUpdateSaleProperty,
  useUploadImages,
} from './queries';
import { salePropertySchema, type SalePropertyFormValues } from './schema';
import type { PropertyImage, SaleProperty } from './types';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const FIELDS: Array<keyof SalePropertyFormValues> = [
  'property_type_id',
  'title',
  'locality',
  'location',
  'size',
  'services',
  'features',
  'map_embed',
  'is_sold',
  'latitude',
  'longitude',
];

type SalePropertyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: SaleProperty | null;
};

function numberField(value: number | null | undefined) {
  return Number.isFinite(value) ? (value as number) : '';
}

export function SalePropertyFormDialog({ open, onOpenChange, property }: SalePropertyFormDialogProps) {
  const isEdit = !!property;
  const qc = useQueryClient();
  const createSaleProperty = useCreateSaleProperty();
  const updateSaleProperty = useUpdateSaleProperty();
  const uploadImages = useUploadImages();
  const deleteImage = useDeleteImage();
  const reorderImages = useReorderImages();
  const isPending =
    createSaleProperty.isPending ||
    updateSaleProperty.isPending ||
    uploadImages.isPending ||
    deleteImage.isPending;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [orderedImages, setOrderedImages] = useState<PropertyImage[]>([]);

  const newPreviews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  const form = useForm<SalePropertyFormValues>({
    resolver: zodResolver(salePropertySchema),
    defaultValues: {
      property_type_id: null,
      title: '',
      locality: '',
      location: '',
      size: '',
      services: '',
      features: '',
      map_embed: '',
      is_sold: false,
      latitude: null,
      longitude: null,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      property_type_id: property?.property_type_id ?? null,
      title: property?.title ?? '',
      locality: property?.locality ?? '',
      location: property?.location ?? '',
      size: property?.size ?? '',
      services: property?.services ?? '',
      features: property?.features ?? '',
      map_embed: property?.map_embed ?? '',
      is_sold: property?.is_sold ?? false,
      latitude: property?.latitude != null ? Number(property.latitude) : null,
      longitude: property?.longitude != null ? Number(property.longitude) : null,
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewFiles([]);
    setRemovedImageIds([]);
    setOrderedImages(property?.images ?? []);
  }, [open, property, form]);

  const existingImages = orderedImages.filter((img) => !removedImageIds.includes(img.id));

  function handleReorderImages(ids: number[]) {
    const byId = new Map(orderedImages.map((img) => [img.id, img]));
    setOrderedImages(ids.map((id) => byId.get(id)!).filter(Boolean));
    reorderImages.mutate(ids);
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    const valid = files.filter((f) => {
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error(`"${f.name}" supera los 5 MB.`);
        return false;
      }
      return true;
    });
    setNewFiles((prev) => [...prev, ...valid]);
  }

  function applyServerErrors(error: unknown): boolean {
    if (!isValidationError(error)) return false;
    const errors = error.response!.data.errors;
    let handled = false;
    for (const [field, messages] of Object.entries(errors)) {
      if ((FIELDS as string[]).includes(field)) {
        form.setError(field as keyof SalePropertyFormValues, { message: messages[0] });
        handled = true;
      }
    }
    return handled;
  }

  async function onSubmit(values: SalePropertyFormValues) {
    const input = {
      ...values,
      locality: values.locality || null,
      location: values.location || null,
      size: values.size || null,
      services: values.services || null,
      features: values.features || null,
      map_embed: values.map_embed || null,
    };

    let saved: SaleProperty;
    try {
      saved = isEdit
        ? await updateSaleProperty.mutateAsync({ id: property.id, input })
        : await createSaleProperty.mutateAsync(input);
    } catch (error) {
      if (!applyServerErrors(error)) {
        toast.error(errorMessage(error, 'No pudimos guardar la propiedad.'));
      }
      return;
    }

    try {
      if (newFiles.length > 0) {
        await uploadImages.mutateAsync({ id: saved.id, files: newFiles });
      }
      for (const id of removedImageIds) {
        await deleteImage.mutateAsync(id);
      }
    } catch (error) {
      await qc.invalidateQueries({ queryKey: queryKeys.salesProperties.all });
      toast.error(errorMessage(error, 'Los datos se guardaron, pero hubo un problema con las fotos.'));
      onOpenChange(false);
      return;
    }

    await qc.invalidateQueries({ queryKey: queryKeys.salesProperties.all });
    toast.success(isEdit ? 'Propiedad actualizada.' : 'Propiedad creada.');
    onOpenChange(false);
  }

  const initialTypeLabel = property?.type?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar propiedad en venta' : 'Nueva propiedad en venta'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modificá los datos y las fotos.' : 'Cargá una nueva propiedad en venta.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Casa céntrica con patio" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="property_type_id"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="sale-type">Categoría</Label>
                    <EntityCombobox<number>
                      id="sale-type"
                      name="property-types"
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      fetchOptions={fetchPropertyTypeOptions}
                      initialLabel={initialTypeLabel}
                      placeholder="Elegí una categoría"
                      searchPlaceholder="Buscar categoría…"
                      emptyMessage="No hay categorías."
                      clearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Guatimozín" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación / descripción</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamaño</FormLabel>
                    <FormControl>
                      <Input placeholder="200 m2" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_sold"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 pt-8">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    </FormControl>
                    <Label className="font-normal">Marcar como vendida</Label>
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
                    <Textarea rows={2} placeholder="Luz, agua, gas…" {...field} value={field.value ?? ''} />
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
                    <Textarea rows={2} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="map_embed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mapa (embed de Google Maps)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="<iframe src=…>" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={numberField(field.value)}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={numberField(field.value)}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Fotos</Label>
              <div className="flex flex-wrap gap-3">
                <DraggableImageGrid
                  images={existingImages}
                  onReorder={handleReorderImages}
                  onRemove={(id) => setRemovedImageIds((prev) => [...prev, id])}
                />
                {newPreviews.map((url, i) => (
                  <div key={url} className="relative size-20 overflow-hidden rounded-md border">
                    <img src={url} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      aria-label="Quitar foto nueva"
                      onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground hover:bg-background"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-muted"
                >
                  <ImagePlus className="size-5" />
                  <span className="text-xs">Agregar</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFilesChange}
              />
              {existingImages.length === 0 && newPreviews.length === 0 && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="size-4" /> JPG, PNG o WebP · máx 5 MB c/u
                </p>
              )}
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
