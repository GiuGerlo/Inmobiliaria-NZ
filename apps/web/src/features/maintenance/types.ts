export type MaintenanceState = {
  enabled: boolean;
  allowed_ip: string | null;
  your_ip: string | null;
};

export type MaintenanceStatus = {
  enabled: boolean;
};
