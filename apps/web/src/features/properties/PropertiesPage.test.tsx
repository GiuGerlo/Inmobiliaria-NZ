import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { PropertiesPage } from './PropertiesPage';

describe('PropertiesPage', () => {
  it('lista las propiedades con ciudad y precio formateado', async () => {
    renderWithProviders(<PropertiesPage />);
    expect(await screen.findByText('Av. Pellegrini 1234')).toBeInTheDocument();
    expect(screen.getByText('$ 120.000')).toBeInTheDocument();
    expect(screen.getByText('Rosario')).toBeInTheDocument();
  });

  it('previsualiza y quita la foto elegida', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PropertiesPage />);
    await screen.findByText('Av. Pellegrini 1234');

    await user.click(screen.getByRole('button', { name: /Nueva propiedad/i }));
    const dialog = await screen.findByRole('dialog');

    const file = new File(['fake'], 'foto.png', { type: 'image/png' });
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);
    // Aparece la vista previa…
    expect(within(dialog).getByAltText('Vista previa')).toBeInTheDocument();
    // …y se puede quitar.
    await user.click(within(dialog).getByRole('button', { name: /Quitar/i }));
    expect(within(dialog).queryByAltText('Vista previa')).not.toBeInTheDocument();
  });

  it('crea una propiedad con ciudad', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PropertiesPage />);
    await screen.findByText('Av. Pellegrini 1234');

    await user.click(screen.getByRole('button', { name: /Nueva propiedad/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Dirección'), 'San Martín 100');
    await user.click(within(dialog).getByLabelText('Ciudad'));
    await user.click(await screen.findByText(/Rosario — Santa Fe/i));
    await user.type(within(dialog).getByLabelText('Tipo'), 'Local');
    await user.type(within(dialog).getByLabelText('Precio'), '90000');
    await user.type(within(dialog).getByLabelText('Servicios'), 'Luz');
    await user.type(within(dialog).getByLabelText('Características'), 'Esquina');

    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Propiedad creada.')).toBeInTheDocument();
    expect(await screen.findByText('San Martín 100')).toBeInTheDocument();
  });

  it('muestra el mensaje del backend ante un 409 al borrar', async () => {
    server.use(
      http.delete(`${API}/properties/:id`, () =>
        HttpResponse.json(
          { message: 'No se puede eliminar la propiedad: tiene contratos asociados.' },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<PropertiesPage />);
    await screen.findByText('Av. Pellegrini 1234');

    await user.click(screen.getByRole('button', { name: 'Acciones de Av. Pellegrini 1234' }));
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await user.click(within(dialog).getByRole('button', { name: /Sí, eliminar/i }));

    expect(await screen.findByText(/tiene contratos asociados/i)).toBeInTheDocument();
  });
});
