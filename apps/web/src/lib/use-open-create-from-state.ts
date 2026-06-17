import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

/**
 * Detecta el `location.state.openCreate` que envían los accesos rápidos del dashboard.
 * Devuelve si hay que abrir el form de alta (usar como valor inicial de un `useState`,
 * no en un effect, para no caer en set-state-in-effect) y consume el state para que
 * volver atrás no reabra el form.
 */
export function useOpenCreateFromState(): boolean {
  const location = useLocation();
  const navigate = useNavigate();
  const requested = (location.state as { openCreate?: boolean } | null)?.openCreate ?? false;

  useEffect(() => {
    if (requested) navigate('.', { replace: true, state: null });
  }, [requested, navigate]);

  return requested;
}
