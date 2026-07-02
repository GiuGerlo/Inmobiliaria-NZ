import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API, USER } from '@/test/server';
import { ProfilePage } from './ProfilePage';

describe('ProfilePage', () => {
  it('precarga los datos de la cuenta y el rol', async () => {
    renderWithProviders(<ProfilePage />);

    expect(await screen.findByDisplayValue(USER.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(USER.email)).toBeInTheDocument();
    expect(screen.getByText('superadmin')).toBeInTheDocument();
  });

  it('actualiza nombre y email', async () => {
    server.use(
      http.patch(`${API}/me`, async ({ request }) => {
        const body = (await request.json()) as { name: string; email: string };
        return HttpResponse.json({ data: { ...USER, ...body } });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    const nameInput = await screen.findByLabelText('Nombre');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nombre Nuevo');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Datos actualizados.')).toBeInTheDocument();
  });

  it('cambia la contraseña con datos válidos', async () => {
    server.use(http.put(`${API}/me/password`, () => new HttpResponse(null, { status: 204 })));
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await user.type(await screen.findByLabelText('Contraseña actual'), 'actual123');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'nueva-clave-123');
    await user.type(screen.getByLabelText('Repetir nueva contraseña'), 'nueva-clave-123');
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(await screen.findByText('Contraseña actualizada.')).toBeInTheDocument();
  });

  it('valida en el cliente que las contraseñas coincidan', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await user.type(await screen.findByLabelText('Contraseña actual'), 'actual123');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'nueva-clave-123');
    await user.type(screen.getByLabelText('Repetir nueva contraseña'), 'otra-distinta-123');
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('muestra el error de campo ante un 422 (contraseña actual incorrecta)', async () => {
    server.use(
      http.put(`${API}/me/password`, () =>
        HttpResponse.json(
          { message: 'Datos inválidos.', errors: { current_password: ['La contraseña actual no es correcta.'] } },
          { status: 422 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await user.type(await screen.findByLabelText('Contraseña actual'), 'incorrecta');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'nueva-clave-123');
    await user.type(screen.getByLabelText('Repetir nueva contraseña'), 'nueva-clave-123');
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeInTheDocument();
  });
});
