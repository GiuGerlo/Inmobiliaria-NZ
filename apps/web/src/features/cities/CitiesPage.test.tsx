import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { CitiesPage } from './CitiesPage';

describe('CitiesPage', () => {
  it('lista las ciudades', async () => {
    renderWithProviders(<CitiesPage />);
    expect(await screen.findByText('Rosario')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('2 resultados')).toBeInTheDocument();
  });

  it('crea una ciudad', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CitiesPage />);
    await screen.findByText('Rosario');

    await user.click(screen.getByRole('button', { name: /Nueva ciudad/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Código postal'), '3000');
    await user.type(within(dialog).getByLabelText('Ciudad'), 'Santa Fe');
    await user.click(within(dialog).getByLabelText('Provincia'));
    await user.click(await screen.findByRole('option', { name: 'Santa Fe' }));
    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Ciudad creada.')).toBeInTheDocument();
    expect(await screen.findByText('3000')).toBeInTheDocument();
  });

  it('muestra el mensaje del backend ante un 409 al borrar', async () => {
    server.use(
      http.delete(`${API}/cities/:code`, () =>
        HttpResponse.json(
          { message: 'No se puede eliminar la ciudad: tiene propiedades asociadas.' },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<CitiesPage />);
    await screen.findByText('Rosario');

    await user.click(screen.getByRole('button', { name: 'Acciones de Rosario' }));
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar/i }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await user.click(within(dialog).getByRole('button', { name: /Sí, eliminar/i }));

    expect(
      await screen.findByText(/tiene propiedades asociadas/i),
    ).toBeInTheDocument();
  });
});
