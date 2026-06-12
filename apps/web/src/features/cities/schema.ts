import { z } from 'zod';

export const citySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'El código postal es obligatorio.')
    .max(10, 'Máximo 10 caracteres.'),
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  province: z.string().trim().min(1, 'La provincia es obligatoria.').max(100, 'Máximo 100 caracteres.'),
});

export type CityFormValues = z.infer<typeof citySchema>;
