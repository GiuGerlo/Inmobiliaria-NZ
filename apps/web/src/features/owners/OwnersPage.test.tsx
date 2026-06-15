import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { OwnersPage } from './OwnersPage';

describe('OwnersPage', () => {
  it('lista los dueños con su ciudad', async () => {
    renderWithProviders(<OwnersPage />);
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    // Ciudad viene del include=city.
    expect(screen.getByText('Rosario')).toBeInTheDocument();
  });

  it('crea un dueño eligiendo la ciudad en el combobox', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OwnersPage />);
    await screen.findByText('Juan Pérez');

    await user.click(screen.getByRole('button', { name: /Nuevo dueño/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nombre y apellido'), 'Carlos Ruiz');
    await user.type(within(dialog).getByLabelText('Teléfono'), '341 555-9');
    await user.type(within(dialog).getByLabelText('Correo electrónico'), 'carlos@nz.com');

    // Combobox de ciudad: abrir, buscar, elegir.
    await user.click(within(dialog).getByLabelText('Ciudad'));
    await user.click(await screen.findByText(/Rosario — Santa Fe/i));

    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Dueño creado.')).toBeInTheDocument();
    expect(await screen.findByText('Carlos Ruiz')).toBeInTheDocument();
  });

  it('muestra el mensaje del backend ante un 409 al borrar', async () => {
    server.use(
      http.delete(`${API}/owners/:id`, () =>
        HttpResponse.json(
          { message: 'No se puede eliminar el dueño: tiene contratos asociados.' },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<OwnersPage />);
    await screen.findByText('Juan Pérez');

    await user.click(screen.getByRole('button', { name: 'Acciones de Juan Pérez' }));
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await user.click(within(dialog).getByRole('button', { name: /Sí, eliminar/i }));

    expect(await screen.findByText(/tiene contratos asociados/i)).toBeInTheDocument();
  });
});
