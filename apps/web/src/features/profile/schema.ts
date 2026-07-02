import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'El correo es obligatorio.')
    .email('Correo inválido.')
    .max(100, 'Máximo 100 caracteres.'),
});

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Ingresá tu contraseña actual.'),
    password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    password_confirmation: z.string().min(1, 'Repetí la nueva contraseña.'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Las contraseñas no coinciden.',
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
