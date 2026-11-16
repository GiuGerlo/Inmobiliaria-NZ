import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { AuditPage } from './AuditPage';
import type { AuditLog } from './types';

const LOGS: AuditLog[] = [
  {
    id: 2,
    created_at: '2026-11-16T10:30:00-03:00',
    event: 'updated',
    user_id: 1,
    user_name: 'Nadina',
    auditable_type: 'Contract',
    auditable_id: '17',
    old_values: { Saldo: '0' },
    new_values: { Saldo: 1500 },
    ip: '10.0.0.1',
    user_agent: 'test',
  },
  {
    id: 1,
    created_at: '2026-11-16T10:00:00-03:00',
    event: 'login_failed',
    user_id: null,
    user_name: null,
    auditable_type: null,
    auditable_id: null,
    old_values: null,
    new_values: { email: 'x@y.com' },
    ip: '10.0.0.1',
    user_agent: 'test',
  },
];

const meta = (total: number) => ({
  current_page: 1,
  from: 1,
  last_page: 1,
  per_page: 50,
  to: total,
  total,
});

describe('AuditPage', () => {
  let lastEventFilter: string | null = null;

  beforeEach(() => {
    lastEventFilter = null;
    server.use(
      http.get(`${API}/users`, () =>
        HttpResponse.json({
          data: [
            {
              id: 1,
              name: 'Nadina',
              email: 'n@n.com',
              role: 'inmobiliaria',
              role_id: 2,
              is_superadmin: false,
            },
          ],
          meta: meta(1),
          links: { first: null, last: null, prev: null, next: null },
        }),
      ),
      http.get(`${API}/audit-logs`, ({ request }) => {
        lastEventFilter = new URL(request.url).searchParams.get('filter[event]');
        const data = lastEventFilter ? LOGS.filter((l) => l.event === lastEventFilter) : LOGS;
        return HttpResponse.json({
          data,
          meta: meta(data.length),
          links: { first: null, last: null, prev: null, next: null },
        });
      }),
    );
  });

  it('lista las acciones con usuario, acción y registro, y muestra el antes/después', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuditPage />);

    expect(await screen.findByText('Contrato #17')).toBeInTheDocument();
    expect(screen.getByText('Modificación', { selector: 'td' })).toBeInTheDocument();
    expect(screen.getByText('Ingreso fallido', { selector: 'td' })).toBeInTheDocument();
    expect(screen.getByText('Sistema', { selector: 'td' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver detalle del registro 2' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Saldo')).toBeInTheDocument();
    expect(within(dialog).getByText('1500')).toBeInTheDocument();
    expect(within(dialog).getByText(/IP 10.0.0.1/)).toBeInTheDocument();
  });

  it('filtra por acción', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuditPage />);
    await screen.findByText('Contrato #17');

    await user.selectOptions(screen.getByLabelText('Acción'), 'login_failed');

    expect(await screen.findByText('Ingreso fallido', { selector: 'td' })).toBeInTheDocument();
    expect(screen.queryByText('Contrato #17')).not.toBeInTheDocument();
    expect(lastEventFilter).toBe('login_failed');
  });

  it('"Actualizar" vuelve a pedir la auditoría', async () => {
    let calls = 0;
    server.use(
      http.get(`${API}/audit-logs`, () => {
        calls++;
        return HttpResponse.json({ data: LOGS, meta: meta(2), links: { first: null, last: null, prev: null, next: null } });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<AuditPage />);
    await screen.findByText('Contrato #17');
    const before = calls;

    await user.click(screen.getByRole('button', { name: /Actualizar/ }));

    await waitFor(() => expect(calls).toBe(before + 1));
  });
});
