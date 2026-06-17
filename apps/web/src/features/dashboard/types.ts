import type { Contract } from '@/features/contracts/types';
import type { Receipt } from '@/features/receipts/types';

export type DashboardTotals = {
  properties: number;
  owners: number;
  tenants: number;
  active_contracts: number;
  receipts_this_month: number;
};

export type ExpiringContract = {
  days_left: number;
  contract: Contract;
};

export type Dashboard = {
  totals: DashboardTotals;
  pending_receipts: Contract[];
  expiring_contracts: ExpiringContract[];
  latest_receipts: Receipt[];
  contracts_with_balance: Contract[];
};
