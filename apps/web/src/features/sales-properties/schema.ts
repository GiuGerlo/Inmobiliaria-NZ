import { z } from 'zod';

export const salePropertySchema = z.object({
  property_type_id: z.number().int().nullable(),
  title: z.string().trim().min(1, 'Requerido.').max(255, 'Máx 255 caracteres.'),
  locality: z.string().max(255, 'Máx 255.').nullable().optional(),
  location: z.string().nullable().optional(),
  size: z.string().max(255, 'Máx 255.').nullable().optional(),
  services: z.string().nullable().optional(),
  features: z.string().nullable().optional(),
  map_embed: z.string().nullable().optional(),
  is_sold: z.boolean().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export type SalePropertyFormValues = z.infer<typeof salePropertySchema>;
