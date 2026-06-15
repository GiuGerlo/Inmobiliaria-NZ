import { z } from 'zod';

export const ownerSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  phone: z.string().trim().min(1, 'El teléfono es obligatorio.').max(20, 'Máximo 20 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'El correo es obligatorio.')
    .email('Correo inválido.')
    .max(100, 'Máximo 100 caracteres.'),
  city_code: z.string().min(1, 'Elegí una ciudad.'),
});

export type OwnerFormValues = z.infer<typeof ownerSchema>;
