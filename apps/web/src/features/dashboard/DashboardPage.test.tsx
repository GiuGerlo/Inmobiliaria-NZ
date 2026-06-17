import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import type { Contract } from '@/features/contracts/types';
import type { Receipt } from '@/features/receipts/types';
import type { Dashboard } from './types';
import { DashboardPage } from './DashboardPage';

function contract(
  id: number,
  owner: string,
  tenant: string,
  address: string,
  end: string,
  balance = 0,
): Contract {
  return {
    id,
    owner_id: id,
    tenant_id: id,
    property_id: id,
    start_date: '2025-01-01',
    end_date: end,
    balance,
    certification: 'Si',
    owner: { id, name: owner, phone: '', email: '', city_code: '2000' },
    tenant: { id, name: tenant, phone: '', email: '', city_code: '2000' },
    property: {
      id,
      address,
      city_code: '2000',
      type: '',
      services: '',
      price: 0,
      features: '',
      photo_url: null,
    },
  };
}

function receipt(number: number, owner: string, tenant: string, propertyAmount: number): Receipt {
  return {
    number,
    contract_id: number,
    payment_method_id: 1,
    paid_at: '2026-06-10',
    property_amount: propertyAmount,
    municipal_amount: 0,
    water_amount: 0,
    electricity_amount: 0,
    gas_amount: 0,
    repairs_amount: 0,
    funeral_amount: 0,
    fees_amount: 0,
    month: 'Junio',
    year: 2026,
    comments: null,
    contract: contract(number, owner, tenant, 'Calle 1', '2027-01-01'),
  };
}

function mockDashboard(payload: Dashboard) {
  server.use(http.get(`${API}/dashboard`, () => HttpResponse.json({ data: payload })));
}

describe('DashboardPage', () => {
  it('muestra accesos rápidos, progreso, últimos recibos y contratos con saldo', async () => {
    mockDashboard({
      totals: {
        properties: 16,
        owners: 11,
        tenants: 15,
        active_contracts: 10,
        receipts_this_month: 3,
      },
      pending_receipts: [contract(1, 'Juan Pérez', 'María López', 'Av. Pellegrini 1234', '2027-01-01')],
      expiring_contracts: [
        { days_left: 23, contract: contract(2, 'Ana Gómez', 'Pedro Díaz', 'Bv. Oroño 500', '2026-07-08') },
      ],
      latest_receipts: [receipt(30, 'Ana Gómez', 'Pedro Díaz', 250000)],
      contracts_with_balance: [
        contract(3, 'Luis Soto', 'Eva Ruiz', 'San Martín 100', '2027-05-01', 45000),
      ],
    });

    renderWithProviders(<DashboardPage />);

    // Accesos rápidos
    expect(await screen.findByText('Nuevo recibo')).toBeInTheDocument();
    expect(screen.getByText('Reporte mensual')).toBeInTheDocument();

    // Progreso: 10 activos, 1 pendiente → 9 emitidos = 90%
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('9 de 10 contratos activos')).toBeInTheDocument();

    // Últimos recibos (monto total) + contratos con saldo
    expect(screen.getByText('Recibo #30 · 10/06/2026')).toBeInTheDocument();
    expect(screen.getByText('Contratos con saldo pendiente')).toBeInTheDocument();
    expect(screen.getByText('$ 45.000')).toBeInTheDocument();
  });

  it('navega al crear recibo desde un acceso rápido', async () => {
    mockDashboard({
      totals: { properties: 0, owners: 0, tenants: 0, active_contracts: 0, receipts_this_month: 0 },
      pending_receipts: [],
      expiring_contracts: [],
      latest_receipts: [],
      contracts_with_balance: [],
    });

    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Todos los recibos del mes emitidos')).toBeInTheDocument();
    // Estados vacíos de los widgets nuevos
    expect(screen.getByText('Todavía no hay recibos emitidos.')).toBeInTheDocument();
    expect(screen.getByText('Sin saldos pendientes')).toBeInTheDocument();

    // El acceso rápido es accionable (no rompe la navegación interna).
    await user.click(screen.getByText('Nuevo recibo'));
  });
});
