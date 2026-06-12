/** Meta de paginación que devuelve Laravel (`AnonymousResourceCollection`). */
export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

/** Respuesta paginada estándar de un `JsonResource::collection`. */
export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
};

/** Forma del 422 de Laravel. */
export type ValidationError = {
  message: string;
  errors: Record<string, string[]>;
};
