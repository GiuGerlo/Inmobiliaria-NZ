export type PaymentMethod = {
  id: number;
  description: string;
};

export type PaymentMethodInput = {
  description: string;
};

export type PaymentMethodListParams = {
  page: number;
  perPage: number;
  sort?: string;
  q?: string;
};
