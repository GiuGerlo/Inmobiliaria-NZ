export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string | null;
  role_id: number | null;
  is_superadmin: boolean;
};

export type AdminUserInput = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role_id: number;
};

export type UserSession = {
  id: string;
  ip_address: string | null;
  user_agent: string;
  last_activity: string;
  is_current: boolean;
};

export type Role = {
  id: number;
  name: string;
  label: string;
};
