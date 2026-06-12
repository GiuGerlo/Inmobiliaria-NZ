import { api } from './api';

let csrfReady = false;

/**
 * Pide la cookie CSRF a Sanctum (`GET /sanctum/csrf-cookie`) una sola vez.
 * Debe llamarse antes del primer login / primera mutación de la sesión.
 * Esta ruta NO está bajo `/api/v1`, por eso el path absoluto.
 */
export async function ensureCsrf(): Promise<void> {
  if (csrfReady) return;
  await api.get('/sanctum/csrf-cookie', { baseURL: '/' });
  csrfReady = true;
}

/** Resetea el flag (p. ej. tras logout) para re-pedir el token en el próximo login. */
export function resetCsrf(): void {
  csrfReady = false;
}
