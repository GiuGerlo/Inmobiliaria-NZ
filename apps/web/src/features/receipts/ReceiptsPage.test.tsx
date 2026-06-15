import { describe, it, expect } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ReceiptsPage } from './ReceiptsPage';

describe('ReceiptsPage', () => {
  it('lista los recibos con contrato, forma de pago y período', async () => {
    renderWithProviders(<ReceiptsPage />);
    expect(await screen.findByText('Juan Pérez - María López')).toBeInTheDocument();
    expect(screen.getByText('Efectivo')).toBeInTheDocument();
    expect(screen.getByText('Enero')).toBeInTheDocument();
    expect(screen.getByText('2 resultados')).toBeInTheDocument();
  });

  it('crea un recibo eligiendo contrato y forma de pago', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: /Nuevo recibo/i }));
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByLabelText('Contrato'));
    await user.click(await screen.findByRole('option', { name: /Juan Pérez - María López/i }));
    await user.click(within(dialog).getByLabelText('Forma de pago'));
    await user.click(await screen.findByRole('option', { name: /Efectivo/i }));

    fireEvent.change(within(dialog).getByLabelText('Fecha de pago'), {
      target: { value: '2025-06-10' },
    });
    fireEvent.change(within(dialog).getByLabelText('Propiedad'), { target: { value: '150000' } });

    await user.click(within(dialog).getByLabelText('Mes'));
    await user.click(await screen.findByRole('option', { name: 'Junio' }));
    fireEvent.change(within(dialog).getByLabelText('Año'), { target: { value: '2025' } });

    await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Recibo creado.')).toBeInTheDocument();
    expect(await screen.findByText('3 resultados')).toBeInTheDocument();
  });

  it('filtra los recibos por contrato', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Ana Gómez - Pedro Díaz');
    expect(screen.getByText('2 resultados')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Filtros/i }));
    await user.click(await screen.findByLabelText('Contrato'));
    await user.click(await screen.findByRole('option', { name: /Juan Pérez - María López/i }));

    expect(await screen.findByText('1 resultado')).toBeInTheDocument();
    expect(screen.queryByText('Ana Gómez - Pedro Díaz')).not.toBeInTheDocument();
  });

  it('elimina un recibo', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: 'Acciones del recibo #1' }));
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await user.click(within(dialog).getByRole('button', { name: /Sí, eliminar/i }));

    expect(await screen.findByText('Recibo eliminado.')).toBeInTheDocument();
    expect(await screen.findByText('1 resultado')).toBeInTheDocument();
  });
});
