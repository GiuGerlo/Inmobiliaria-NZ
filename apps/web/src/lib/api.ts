import axios, { AxiosError } from 'axios';

/**
 * Cliente axios para la API. La SPA vive en el mismo dominio que Laravel
 * (nginx en :8080), así que usamos auth Sanctum cookie-based:
 * - `withCredentials`: manda/recibe la cookie de sesión HttpOnly.
 * - `withXSRFToken`: axios lee la cookie `XSRF-TOKEN` y la reenvía en el
 *   header `X-XSRF-TOKEN` en cada mutación (CSRF de Sanctum).
 */
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler = () => {};

/** Registra qué hacer cuando el server responde 401 (sesión expirada). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    // El 401 de /auth/login y /me es esperado (credenciales malas / no logueado):
    // lo maneja quien hizo la llamada, no disparamos el redirect global.
    const isAuthProbe = url.includes('/auth/login') || url.endsWith('/me');
    if (status === 401 && !isAuthProbe) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);
