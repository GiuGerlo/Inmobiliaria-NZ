import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/utils';
import { server, API, USER } from '@/test/server';
import { MaintenancePage } from './MaintenancePage';
import { AppLayout } from '@/components/layout/AppLayout';

describe('Modo mantenimiento — página del superadmin', () => {
  it('activa el mantenimiento y refleja el estado', async () => {
    const user = userEvent.setup();
    let state = { enabled: false, allowed_ip: null as string | null, your_ip: '1.2.3.4' };
    server.use(
      http.get(`${API}/maintenance`, () => HttpResponse.json(state)),
      http.post(`${API}/maintenance`, () => {
        state = { enabled: true, allowed_ip: '1.2.3.4', your_ip: '1.2.3.4' };
        return HttpResponse.json(state);
      }),
    );

    renderWithProviders(<MaintenancePage />);

    // Espera a que cargue el estado (el botón aparece recién con los datos).
    await user.click(await screen.findByRole('button', { name: /Activar mantenimiento/i }));

    expect(await screen.findByText('Activado')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Desactivar mantenimiento/i }),
    ).toBeInTheDocument();
  });
});

describe('Modo mantenimiento — gate del SPA', () => {
  it('un usuario no-superadmin ve la pantalla de mantenimiento', async () => {
    server.use(
      http.get(`${API}/me`, () =>
        HttpResponse.json({ data: { ...USER, is_superadmin: false, role: 'inmobiliaria' } }),
      ),
      http.get(`${API}/maintenance/status`, () => HttpResponse.json({ enabled: true })),
    );

    renderWithProviders(<AppLayout />);

    expect(await screen.findByText('Estamos en mantenimiento')).toBeInTheDocument();
  });

  it('el superadmin no queda bloqueado (entra al admin)', async () => {
    server.use(http.get(`${API}/maintenance/status`, () => HttpResponse.json({ enabled: true })));

    renderWithProviders(<AppLayout />);

    expect((await screen.findAllByText('Inmobiliaria NZ')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Estamos en mantenimiento')).not.toBeInTheDocument();
  });
});
