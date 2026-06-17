import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { MadeByGerlo } from '@/components/MadeByGerlo';
import { isValidationError, errorStatus, errorMessage } from '@/lib/api-error';
import { useAuth, useLogin } from './useAuth';
import { loginSchema, type LoginFormValues } from './schema';

type LocationState = { from?: { pathname: string } };

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  // Si ya hay sesión, no mostramos el login.
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function onSubmit(values: LoginFormValues) {
    login.mutate(values, {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
      onError: (error) => {
        if (isValidationError(error)) {
          const errors = error.response!.data.errors;
          for (const [field, messages] of Object.entries(errors)) {
            if (field === 'email' || field === 'password') {
              form.setError(field, { message: messages[0] });
            }
          }
          return;
        }
        if (errorStatus(error) === 429) {
          toast.error('Demasiados intentos. Esperá un momento e intentá de nuevo.');
          return;
        }
        toast.error(errorMessage(error, 'No pudimos iniciar sesión.'));
      },
    });
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Panel de marca (navy) — oculto en mobile */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
        {/* Acentos decorativos sutiles */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-nz-gold/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative flex items-center gap-2 text-sm font-medium tracking-wide text-sidebar-foreground/70">
          <span className="inline-block h-px w-8 bg-nz-gold" />
          ADMINISTRACIÓN DE ALQUILERES
        </div>

        <div className="relative flex flex-col items-start gap-6">
          <img src="/logo-nz.jpg" alt="Nadina Zaranich — Estudio Jurídico-Inmobiliario" className="h-28 w-auto rounded-xl" />
          <div className="space-y-3">
            <span className="block h-0.5 w-12 bg-nz-gold" />
            <h2 className="max-w-sm text-2xl font-semibold leading-snug">
              Gestión integral de alquileres y contratos
            </h2>
            <p className="max-w-sm text-sm text-sidebar-foreground/60">
              Recibos, rendiciones y propiedades en un solo lugar.
            </p>
          </div>
        </div>

        <p className="relative text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} · Estudio Jurídico-Inmobiliario Nadina Zaranich
        </p>
      </aside>

      {/* Panel del formulario */}
      <main className="flex flex-col bg-background p-6 sm:p-10">
        <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm">
          {/* Logo compacto solo en mobile (el panel navy está oculto) */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img src="/logo-nz.jpg" alt="Inmobiliaria NZ" className="mb-3 h-20 w-auto rounded-lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-muted-foreground">Ingresá con tu cuenta para continuar.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="tu@correo.com"
                        className="h-11"
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
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel htmlFor="remember" className="font-normal text-muted-foreground">
                      Mantener sesión iniciada
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button type="submit" className="h-11 w-full text-base" disabled={login.isPending}>
                {login.isPending && <Loader2 className="size-4 animate-spin" />}
                Iniciar sesión
              </Button>
            </form>
          </Form>
        </div>
        </div>
        <div className="flex justify-center pt-6">
          <MadeByGerlo variant="light" className="items-center text-center" />
        </div>
      </main>
    </div>
  );
}
