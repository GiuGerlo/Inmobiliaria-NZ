export type City = {
  code: string;
  name: string;
  province: string;
};

export type CityInput = {
  code: string;
  name: string;
  province: string;
};

/** Parámetros de listado que viajan a la API (`?page&per_page&sort&q&filter[province]`). */
export type CityListParams = {
  page: number;
  perPage: number;
  sort?: string;
  q?: string;
  province?: string;
};
