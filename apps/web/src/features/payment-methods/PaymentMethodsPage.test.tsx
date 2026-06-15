import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { PaymentMethodsPage } from './PaymentMethodsPage';

describe('PaymentMethodsPage', () => {
  it('lista las formas de pago', async () => {
    renderWithProviders(<PaymentMethodsPage />);
    expect(await screen.findByText('Efectivo')).toBeInTheDocument();
    expect(screen.getByText('Transferencia')).toBeInTheDocument();
    expect(screen.getByText('2 resultados')).toBeInTheDocument();
  });

  it('crea una forma de pago', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentMethodsPage />);
    await screen.findByText('Efectivo');

    await user.click(screen.getByRole('button', { name: /Nueva forma de pago/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Descripción'), 'Cheque');
    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Forma de pago creada.')).toBeInTheDocument();
    expect(await screen.findByText('Cheque')).toBeInTheDocument();
  });

  it('muestra el mensaje del backend ante un 409 al borrar', async () => {
    server.use(
      http.delete(`${API}/payment-methods/:id`, () =>
        HttpResponse.json(
          { message: 'No se puede eliminar la forma de pago: tiene recibos asociados.' },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<PaymentMethodsPage />);
    await screen.findByText('Efectivo');

    await user.click(screen.getByRole('button', { name: 'Acciones de Efectivo' }));
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await user.click(within(dialog).getByRole('button', { name: /Sí, eliminar/i }));

    expect(await screen.findByText(/tiene recibos asociados/i)).toBeInTheDocument();
  });
});
