import { z } from 'zod';

export const contractSchema = z
  .object({
    owner_id: z.number({ message: 'Elegí un dueño.' }),
    tenant_id: z.number({ message: 'Elegí un inquilino.' }),
    property_id: z.number({ message: 'Elegí una propiedad.' }),
    start_date: z.string().min(1, 'Elegí la fecha de inicio.'),
    end_date: z.string().min(1, 'Elegí la fecha de fin.'),
    balance: z.number().int('Debe ser un entero.').min(0, 'No puede ser negativo.').optional(),
    certification: z.enum(['Si', 'No'], { message: 'Elegí una opción.' }),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: 'La fecha de fin debe ser posterior al inicio.',
    path: ['end_date'],
  });

export type ContractFormValues = z.infer<typeof contractSchema>;
