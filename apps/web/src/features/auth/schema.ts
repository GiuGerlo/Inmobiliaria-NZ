import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Ingresá tu correo.').email('Correo inválido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
  remember: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
