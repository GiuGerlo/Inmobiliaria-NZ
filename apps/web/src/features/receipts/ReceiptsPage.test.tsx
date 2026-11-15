import { describe, it, expect } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
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

  it('precarga hoy y el alquiler + forma de pago del último recibo del contrato', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: /Nuevo recibo/i }));
    const dialog = await screen.findByRole('dialog');

    const now = new Date();
    expect(within(dialog).getByLabelText('Fecha de pago')).toHaveValue(now.toLocaleDateString('sv-SE'));
    expect(within(dialog).getByLabelText('Año')).toHaveValue(now.getFullYear());

    await user.click(within(dialog).getByLabelText('Contrato'));
    await user.click(await screen.findByRole('option', { name: /Juan Pérez - María López/i }));

    // El último recibo del contrato 1 es de $120.000 en Efectivo.
    expect(await within(dialog).findByDisplayValue('120000')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Forma de pago')).toHaveTextContent('Efectivo');
  });

  it('muestra en el detalle los envíos por WhatsApp del recibo con sus horas', async () => {
    server.use(
      http.get(`${API}/whatsapp/messages`, ({ request }) => {
        const receiptId = new URL(request.url).searchParams.get('filter[receipt_id]');
        const rows =
          receiptId === '1'
            ? [
                {
                  id: 9, batch_id: null, receipt_id: 1, type: 'recibo', recipient_phone: '+5493410000000',
                  recipient_name: 'María López', body: 'x', status: 'read', error: null,
                  sent_at: '2026-11-15T17:03:00-03:00', delivered_at: '2026-11-15T17:04:00-03:00',
                  read_at: '2026-11-15T17:20:00-03:00', created_at: '2026-11-15T17:03:00-03:00',
                },
              ]
            : [];
        return HttpResponse.json({ data: rows, meta: { total: rows.length }, links: {} });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    await user.click(screen.getByRole('button', { name: 'Ver detalle del recibo #1' }));
    const dialog = await screen.findByRole('dialog');

    expect(await within(dialog).findByText('Envíos por WhatsApp')).toBeInTheDocument();
    expect(await within(dialog).findByText('Leído')).toBeInTheDocument();
    expect(within(dialog).getByText(/Entregado: /)).toBeInTheDocument();
    expect(within(dialog).getByText(/Leído: /)).toBeInTheDocument();
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

  it('muestra los paneles del mes al pie (por hacer / hechos)', async () => {
    renderWithProviders(<ReceiptsPage />);
    await screen.findByText('Juan Pérez - María López');

    expect(screen.getByText('Recibos pendientes del mes')).toBeInTheDocument();
    expect(screen.getByText('Recibos hechos este mes')).toBeInTheDocument();
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
