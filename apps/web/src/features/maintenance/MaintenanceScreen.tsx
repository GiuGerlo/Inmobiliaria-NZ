import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/useAuth';

/**
 * Pantalla completa que ve un usuario no-superadmin mientras el modo mantenimiento
 * está activo. El superadmin nunca la ve (gestiona el modo desde /mantenimiento).
 */
export function MaintenanceScreen() {
  const logout = useLogout();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-muted/30 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Wrench className="size-7 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-semibold">Estamos en mantenimiento</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Estamos haciendo mejoras en el sistema. Volvé a intentar en un rato.
      </p>
      <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
        Cerrar sesión
      </Button>
    </div>
  );
}
