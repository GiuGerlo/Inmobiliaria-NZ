import { Navigate, Outlet } from 'react-router';
import { useAuth } from './useAuth';

/** Gatea rutas solo-superadmin. Asume que RequireAuth ya garantizó la sesión. */
export function RequireSuperadmin() {
  const { user } = useAuth();

  if (!user?.is_superadmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
