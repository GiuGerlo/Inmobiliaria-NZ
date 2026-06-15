import { z } from 'zod';

/** Meses de rendición, espejo de StoreReceiptRequest::MONTHS (backend). */
export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export type Month = (typeof MONTHS)[number];

const amount = z.number().int('Debe ser un entero.').min(0, 'No puede ser negativo.');

export const receiptSchema = z.object({
  contract_id: z.number({ message: 'Elegí un contrato.' }),
  payment_method_id: z.number({ message: 'Elegí una forma de pago.' }),
  paid_at: z.string().min(1, 'Elegí la fecha de pago.'),
  property_amount: amount,
  municipal_amount: amount.optional(),
  water_amount: amount.optional(),
  electricity_amount: amount.optional(),
  gas_amount: amount.optional(),
  repairs_amount: amount.optional(),
  funeral_amount: amount.optional(),
  fees_amount: amount.optional(),
  month: z.enum(MONTHS, { message: 'Elegí un mes.' }),
  year: z
    .number({ message: 'Ingresá el año.' })
    .int('Debe ser un entero.')
    .min(2000, 'Año mínimo 2000.')
    .max(2100, 'Año máximo 2100.'),
  comments: z.string().max(200, 'Máximo 200 caracteres.').nullable().optional(),
});

export type ReceiptFormValues = z.infer<typeof receiptSchema>;
