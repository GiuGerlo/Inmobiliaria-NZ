import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { TenantsPage } from './TenantsPage';

describe('TenantsPage', () => {
  it('lista los inquilinos con su ciudad', async () => {
    renderWithProviders(<TenantsPage />);
    expect(await screen.findByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Pedro Díaz')).toBeInTheDocument();
    expect(screen.getByText('Rosario')).toBeInTheDocument();
  });

  it('crea un inquilino eligiendo la ciudad en el combobox', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TenantsPage />);
    await screen.findByText('María López');

    await user.click(screen.getByRole('button', { name: /Nuevo inquilino/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nombre y apellido'), 'Lucía Torres');
    await user.type(within(dialog).getByLabelText('Teléfono'), '341 555-8');
    await user.type(within(dialog).getByLabelText('Correo electrónico'), 'lucia@nz.com');
    await user.click(within(dialog).getByLabelText('Ciudad'));
    await user.click(await screen.findByText(/Rosario — Santa Fe/i));
    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Inquilino creado.')).toBeInTheDocument();
    expect(await screen.findByText('Lucía Torres')).toBeInTheDocument();
  });

  it('muestra el mensaje del backend ante un 409 al borrar', async () => {
    server.use(
      http.delete(`${API}/tenants/:id`, () =>
        HttpResponse.json(
          { message: 'No se puede eliminar el inquilino: tiene contratos asociados.' },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<TenantsPage />);
    await screen.findByText('María López');

    await user.click(screen.getByRole('button', { name: 'Acciones de María López' }));
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await user.click(within(dialog).getByRole('button', { name: /Sí, eliminar/i }));

    expect(await screen.findByText(/tiene contratos asociados/i)).toBeInTheDocument();
  });
});
