import { z } from 'zod';

export const propertySchema = z.object({
  address: z.string().trim().min(1, 'La dirección es obligatoria.').max(100, 'Máximo 100 caracteres.'),
  city_code: z.string().min(1, 'Elegí una ciudad.'),
  type: z.string().trim().min(1, 'El tipo es obligatorio.').max(50, 'Máximo 50 caracteres.'),
  services: z.string().trim().min(1, 'Indicá los servicios.').max(200, 'Máximo 200 caracteres.'),
  price: z
    .number({ message: 'Ingresá un precio válido.' })
    .int('Debe ser un número entero.')
    .min(0, 'No puede ser negativo.'),
  features: z.string().trim().min(1, 'Indicá las características.').max(200, 'Máximo 200 caracteres.'),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
