import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ReceiptsPage } from './ReceiptsPage';

describe('Envío por WhatsApp', () => {
  it('abre el modal con el inquilino y su teléfono prellenado, y envía', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: 'Acciones del recibo #1' }));
    await user.click(await screen.findByText('Enviar recibo (inquilino)'));

    const dialog = await screen.findByRole('dialog');
    // Destinatario = inquilino del contrato 1 (María López) con su teléfono de la ficha.
    expect(within(dialog).getByText('María López')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Teléfono destino')).toHaveValue('341 555-3');
    expect(within(dialog).getByText(/te enviamos el recibo de alquiler/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /Enviar/i }));

    expect(await screen.findByText(/Enviando recibo por WhatsApp a María López/i)).toBeInTheDocument();
  });

  it('para rendición usa al dueño del contrato', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: 'Acciones del recibo #1' }));
    await user.click(await screen.findByText('Enviar rendición (dueño)'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Juan Pérez')).toBeInTheDocument();
    expect(within(dialog).getByText(/adjuntamos la rendición/i)).toBeInTheDocument();
  });
});
