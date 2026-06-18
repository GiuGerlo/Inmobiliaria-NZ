import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { RemindersPage } from './RemindersPage';

describe('Recordatorios por WhatsApp', () => {
  it('envía el recordatorio de pago masivo y muestra el progreso', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RemindersPage />);

    await screen.findByText('Recordatorio de pago mensual');
    await screen.findByText('María López'); // inquilino cargado

    await user.type(screen.getByLabelText(/Fecha límite/i), 'MIÉRCOLES 10 AL MEDIODÍA');
    await user.click(screen.getByRole('button', { name: /Enviar a 2/i }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Envío finalizado')).toBeInTheDocument();
    expect(screen.getByText('✓ 2 enviados')).toBeInTheDocument();
  });

  it('compone y envía un recordatorio de faltantes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RemindersPage />);

    await user.click(screen.getByRole('button', { name: 'Faltantes' }));
    await screen.findByText('María López');

    await user.click(screen.getAllByRole('button', { name: /Componer/i })[0]);

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByLabelText('municipal'));
    expect(within(dialog).getByLabelText('Texto (editable)')).toHaveValue(
      'pasarme foto del pago de municipal',
    );

    await user.click(within(dialog).getByRole('button', { name: /Enviar/i }));
    expect(await screen.findByText(/Recordatorio enviado a/i)).toBeInTheDocument();
  });

  it('muestra el historial vacío al inicio', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RemindersPage />);

    await user.click(screen.getByRole('button', { name: 'Historial' }));
    expect(await screen.findByText('Todavía no se enviaron mensajes.')).toBeInTheDocument();
  });
});
