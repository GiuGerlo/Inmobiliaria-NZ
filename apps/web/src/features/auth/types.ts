export type User = {
  id: number;
  name: string;
  email: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember: boolean;
};
