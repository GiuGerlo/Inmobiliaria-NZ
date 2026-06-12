import { AxiosError } from 'axios';
import type { ValidationError } from './types';

/** ¿Es un 422 de validación de Laravel? */
export function isValidationError(error: unknown): error is AxiosError<ValidationError> {
  return (
    error instanceof AxiosError &&
    error.response?.status === 422 &&
    typeof error.response.data?.errors === 'object'
  );
}

/** Código HTTP del error, o undefined si no es un error de axios. */
export function errorStatus(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined;
}

/** Mensaje legible para mostrar en un toast. Usa el `message` del backend si existe. */
export function errorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}
