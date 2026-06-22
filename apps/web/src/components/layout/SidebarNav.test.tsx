import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { server, API, USER } from '@/test/server';
import { SidebarNav } from './SidebarNav';

describe('SidebarNav gating', () => {
  it('muestra "Propiedades en venta" al superadmin', async () => {
    renderWithProviders(<SidebarNav />);

    expect(await screen.findByText('Propiedades en venta')).toBeInTheDocument();
  });

  it('oculta "Propiedades en venta" si no es superadmin', async () => {
    server.use(
      http.get(`${API}/me`, () =>
        HttpResponse.json({ data: { ...USER, role: 'inmobiliaria', is_superadmin: false } }),
      ),
    );

    renderWithProviders(<SidebarNav />);

    // Inicio siempre está → garantiza que el nav renderizó antes de aserción negativa.
    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(screen.queryByText('Propiedades en venta')).not.toBeInTheDocument();
  });
});
