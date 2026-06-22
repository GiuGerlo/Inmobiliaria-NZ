import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { SalesPropertiesPage } from './SalesPropertiesPage';

describe('SalesPropertiesPage', () => {
  it('lista las propiedades con categoría y estado', async () => {
    renderWithProviders(<SalesPropertiesPage />);

    expect(await screen.findByText('Casa céntrica')).toBeInTheDocument();
    expect(screen.getByText('Terreno esquina')).toBeInTheDocument();
    expect(screen.getByText('Vendida')).toBeInTheDocument();
  });

  it('crea una propiedad', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SalesPropertiesPage />);
    await screen.findByText('Casa céntrica');

    await user.click(screen.getByRole('button', { name: /Nueva propiedad/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Título'), 'Quinta con pileta');
    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Propiedad creada.')).toBeInTheDocument();
  });

  it('filtra por vendidas', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SalesPropertiesPage />);
    await screen.findByText('Casa céntrica');

    await user.click(screen.getByRole('combobox', { name: 'Filtrar por estado' }));
    await user.click(await screen.findByRole('option', { name: 'Vendidas' }));

    expect(await screen.findByText('Terreno esquina')).toBeInTheDocument();
    expect(screen.queryByText('Casa céntrica')).not.toBeInTheDocument();
  });

  it('elimina una propiedad', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SalesPropertiesPage />);
    await screen.findByText('Casa céntrica');

    await user.click(screen.getByRole('button', { name: 'Acciones de Casa céntrica' }));
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar/i }));
    const dialog = await screen.findByRole('dialog');
    // Doble confirmación: primer click arma, segundo confirma.
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await user.click(await within(dialog).findByRole('button', { name: /Sí, eliminar/i }));

    expect(await screen.findByText('Propiedad eliminada.')).toBeInTheDocument();
  });

  it('abre el visor de fotos al clickear la miniatura', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SalesPropertiesPage />);
    await screen.findByText('Casa céntrica');

    await user.click(screen.getByRole('button', { name: 'Ver fotos de Casa céntrica' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByText('Imagen 1 de 2')).toBeInTheDocument();
    // Navega a la siguiente.
    await user.click(within(dialog).getByRole('button', { name: 'Siguiente' }));
    expect(within(dialog).getByText('Imagen 2 de 2')).toBeInTheDocument();
  });

  it('crea una categoría desde el diálogo', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SalesPropertiesPage />);
    await screen.findByText('Casa céntrica');

    await user.click(screen.getByRole('button', { name: /Categorías/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nueva categoría'), 'Quintas');
    await user.click(within(dialog).getByRole('button', { name: /Agregar/i }));

    expect(await screen.findByText('Categoría creada.')).toBeInTheDocument();
  });
});
