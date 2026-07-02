import { useEffect } from 'react';
import {
  useForm,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { isValidationError, errorMessage } from '@/lib/api-error';
import { useAuth } from '@/features/auth/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useUpdatePassword, useUpdateProfile } from './queries';
import {
  passwordSchema,
  profileSchema,
  type PasswordFormValues,
  type ProfileFormValues,
} from './schema';

/** Vuelca los errores 422 del backend sobre los campos del form (mismo patrón que OwnerFormDialog). */
function applyServerErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: unknown,
  fields: Array<Path<T>>,
): boolean {
  if (!isValidationError(error)) return false;
  const errors = error.response!.data.errors;
  for (const [field, messages] of Object.entries(errors)) {
    if ((fields as string[]).includes(field)) {
      form.setError(field as Path<T>, { message: messages[0] });
    }
  }
  return true;
}

function AccountCard() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  useEffect(() => {
    if (user) form.reset({ name: user.name, email: user.email });
  }, [user, form]);

  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values, {
      onSuccess: () => toast.success('Datos actualizados.'),
      onError: (error) => {
        if (!applyServerErrors(form, error, ['name', 'email'])) {
          toast.error(errorMessage(error, 'No pudimos guardar los datos.'));
        }
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la cuenta</CardTitle>
        <CardDescription>Actualizá tu nombre y correo.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@correo.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>Rol</Label>
              <div>
                <Badge variant="secondary">{user?.role ?? '—'}</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function PasswordCard() {
  const updatePassword = useUpdatePassword();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  function onSubmit(values: PasswordFormValues) {
    updatePassword.mutate(values, {
      onSuccess: () => {
        toast.success('Contraseña actualizada.');
        form.reset();
      },
      onError: (error) => {
        const fields: Array<Path<PasswordFormValues>> = [
          'current_password',
          'password',
          'password_confirmation',
        ];
        if (!applyServerErrors(form, error, fields)) {
          toast.error(errorMessage(error, 'No pudimos cambiar la contraseña.'));
        }
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>
          Al cambiarla se cierran tus otras sesiones. Esta sesión sigue activa.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña actual</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repetir nueva contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={updatePassword.isPending}>
              {updatePassword.isPending && <Loader2 className="size-4 animate-spin" />}
              Cambiar contraseña
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Gestioná tus datos y tu contraseña.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <AccountCard />
        <PasswordCard />
      </div>
    </div>
  );
}
