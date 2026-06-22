export type User = {
  id: number;
  name: string;
  email: string;
  role: string | null;
  is_superadmin: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember: boolean;
};
