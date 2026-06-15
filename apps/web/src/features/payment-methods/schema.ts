import { z } from 'zod';

export const paymentMethodSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(40, 'Máximo 40 caracteres.'),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;
