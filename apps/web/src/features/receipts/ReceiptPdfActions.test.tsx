import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ReceiptsPage } from './ReceiptsPage';

describe('Acciones de PDF de recibos', () => {
  afterEach(() => vi.restoreAllMocks());

  it('abre el detalle del recibo en un modal con toda la info', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: 'Ver detalle del recibo #1' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Av. Pellegrini 1234')).toBeInTheDocument();
    expect(within(dialog).getByText('Efectivo')).toBeInTheDocument();
    expect(within(dialog).getByText('Alquiler')).toBeInTheDocument();
    expect(within(dialog).getByText('Total del recibo')).toBeInTheDocument();
    expect(within(dialog).getAllByText('$ 120.000').length).toBeGreaterThan(0);
  });

  it('abre el recibo PDF en pestaña nueva desde el menú de la fila', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: 'Recibo del recibo #1' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Ver / descargar' }));

    expect(open).toHaveBeenCalledWith('/api/v1/receipts/1/pdf', '_blank', 'noopener');
  });

  it('abre la rendición PDF en pestaña nueva desde el menú de la fila', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: 'Rendición del recibo #1' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Ver / descargar' }));

    expect(open).toHaveBeenCalledWith('/api/v1/receipts/1/settlement', '_blank', 'noopener');
  });

  it('ofrece enviar el recibo al inquilino desde el mismo menú', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: 'Recibo del recibo #1' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Enviar al inquilino' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('genera el listado mensual con el mes y año elegidos', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByLabelText('Mes del reporte'));
    await user.click(await screen.findByRole('option', { name: 'Marzo' }));

    const year = screen.getByLabelText('Año del reporte');
    await user.clear(year);
    await user.type(year, '2025');

    await user.click(screen.getByRole('button', { name: /Generar PDF/i }));

    expect(open).toHaveBeenCalledWith(
      '/api/v1/reports/monthly-payments?month=Marzo&year=2025',
      '_blank',
      'noopener',
    );
  });
});
