import { describe, it, expect } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { RemindersPage } from './RemindersPage';

describe('Recordatorios por WhatsApp', () => {
  it('envía el recordatorio de pago masivo y muestra el progreso', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RemindersPage />);

    await screen.findByText('Recordatorio de pago mensual');
    await screen.findAllByText('María López'); // inquilino cargado

    await user.type(screen.getByLabelText(/Fecha límite/i), 'MIÉRCOLES 10 AL MEDIODÍA');
    await user.click(screen.getByRole('button', { name: /Enviar a 2/i }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Envío finalizado')).toBeInTheDocument();
    expect(screen.getByText('✓ 2 enviados')).toBeInTheDocument();
  });

  it('arranca tildando solo a quien no tiene recibo del mes', async () => {
    // Solo el contrato de Pedro (id 2) está pendiente; María ya pagó.
    server.use(
      http.get(`${API}/dashboard`, () =>
        HttpResponse.json({
          data: {
            totals: { properties: 0, owners: 0, tenants: 0, active_contracts: 0, receipts_this_month: 0 },
            pending_receipts: [{ id: 2, owner_id: 2, tenant_id: 2, property_id: 2 }],
            expiring_contracts: [],
            latest_receipts: [],
            contracts_with_balance: [],
          },
        }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<RemindersPage />);

    await screen.findByText('María López');
    expect(await screen.findByRole('button', { name: /Enviar a 1/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Pedro Díaz/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /María López/ })).not.toBeChecked();
    expect(screen.getAllByText('sin recibo')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Seleccionar todos' }));
    expect(screen.getByRole('button', { name: /Enviar a 2/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Solo sin recibo' }));
    expect(screen.getByRole('button', { name: /Enviar a 1/i })).toBeInTheDocument();
  });

  it('busca inquilinos y quita seleccionados desde el panel derecho', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RemindersPage />);

    expect(await screen.findByText('Seleccionados (2)')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Buscar inquilino'), 'pedro');
    expect(screen.queryByRole('checkbox', { name: /María López/ })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Pedro Díaz/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quitar a María López' }));
    expect(screen.getByText('Seleccionados (1)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar a 1/i })).toBeInTheDocument();
  });

  it('filtra el historial por nombre, tipo, estado y fechas', async () => {
    const seen: URLSearchParams[] = [];
    server.use(
      http.get(`${API}/whatsapp/messages`, ({ request }) => {
        seen.push(new URL(request.url).searchParams);
        return HttpResponse.json({ data: [], meta: { total: 0 }, links: {} });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<RemindersPage />);
    await user.click(screen.getByRole('button', { name: 'Historial' }));

    await user.type(await screen.findByLabelText('Buscar'), 'ana');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'recibo');
    await user.selectOptions(screen.getByLabelText('Estado'), 'failed');
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-01' } });

    await waitFor(() => {
      const last = seen.at(-1)!;
      expect(last.get('filter[q]')).toBe('ana');
      expect(last.get('filter[type]')).toBe('recibo');
      expect(last.get('filter[status]')).toBe('failed');
      expect(last.get('filter[from]')).toBe('2026-11-01');
    });
    expect(screen.getByText('No hay mensajes con esos filtros.')).toBeInTheDocument();
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
