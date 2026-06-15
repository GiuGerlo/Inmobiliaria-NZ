import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { ContractsPage } from './ContractsPage';

describe('ContractsPage', () => {
  it('lista los contratos con propiedad, inquilino y dueño', async () => {
    renderWithProviders(<ContractsPage />);
    expect(await screen.findByText('Av. Pellegrini 1234')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('2 resultados')).toBeInTheDocument();
  });

  it('crea un contrato eligiendo propiedad, dueño e inquilino', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContractsPage />);
    await screen.findByText('Av. Pellegrini 1234');

    await user.click(screen.getByRole('button', { name: /Nuevo contrato/i }));
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByLabelText('Propiedad'));
    await user.click(await screen.findByRole('option', { name: /Av. Pellegrini 1234/i }));
    await user.click(within(dialog).getByLabelText('Dueño'));
    await user.click(await screen.findByRole('option', { name: /Juan Pérez/i }));
    await user.click(within(dialog).getByLabelText('Inquilino'));
    await user.click(await screen.findByRole('option', { name: /María López/i }));

    fireEvent.change(within(dialog).getByLabelText('Inicio'), { target: { value: '2025-06-01' } });
    fireEvent.change(within(dialog).getByLabelText('Fin'), { target: { value: '2026-06-01' } });

    await user.click(within(dialog).getByLabelText('Certificación'));
    await user.click(await screen.findByRole('option', { name: 'Sí' }));

    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Contrato creado.')).toBeInTheDocument();
    expect(await screen.findByText('3 resultados')).toBeInTheDocument();
  });

  it('filtra los contratos por dueño', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContractsPage />);
    await screen.findByText('Bv. Oroño 500');
    expect(screen.getByText('2 resultados')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Filtros/i }));
    await user.click(await screen.findByLabelText('Dueño'));
    await user.click(await screen.findByRole('option', { name: /Juan Pérez/i }));

    // Solo el contrato del dueño elegido (Av. Pellegrini); el otro desaparece.
    expect(await screen.findByText('1 resultado')).toBeInTheDocument();
    expect(screen.queryByText('Bv. Oroño 500')).not.toBeInTheDocument();
  });

  it('muestra el mensaje del backend ante un 409 al borrar', async () => {
    server.use(
      http.delete(`${API}/contracts/:id`, () =>
        HttpResponse.json(
          { message: 'No se puede eliminar el contrato: tiene recibos asociados.' },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<ContractsPage />);
    await screen.findByText('Av. Pellegrini 1234');

    await user.click(screen.getByRole('button', { name: 'Acciones del contrato #1' }));
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await user.click(within(dialog).getByRole('button', { name: /Sí, eliminar/i }));

    expect(await screen.findByText(/tiene recibos asociados/i)).toBeInTheDocument();
  });
});
