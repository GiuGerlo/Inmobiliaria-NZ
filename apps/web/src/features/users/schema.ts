import { z } from 'zod';

export const createUserSchema = z
  .object({
    name: z.string().min(1, 'Requerido').max(100),
    email: z.string().email('Email inválido').max(100),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(1, 'Requerido'),
    role_id: z.number().int().positive('Requerido'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  });

export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Requerido').max(100),
    email: z.string().email('Email inválido').max(100),
    password: z.union([z.string().min(8, 'Mínimo 8 caracteres'), z.literal('')]).optional(),
    password_confirmation: z.string().optional(),
    role_id: z.number().int().positive('Requerido'),
  })
  .refine(
    (data) => {
      if (!data.password) return true;
      return data.password === data.password_confirmation;
    },
    { message: 'Las contraseñas no coinciden', path: ['password_confirmation'] },
  );

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
