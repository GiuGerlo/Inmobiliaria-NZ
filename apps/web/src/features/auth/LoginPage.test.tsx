import { describe, it, expect, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { server, API } from '@/test/server';
import { LoginPage } from './LoginPage';

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ciudades" element={<div>Pantalla ciudades</div>} />
    </Routes>,
    { route: '/login' },
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    // Arranca sin sesión.
    server.use(http.get(`${API}/me`, () => new HttpResponse(null, { status: 401 })));
  });

  it('inicia sesión y navega a ciudades', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(await screen.findByLabelText('Correo electrónico'), 'admin@nz.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Pantalla ciudades')).toBeInTheDocument();
  });

  it('muestra el error de campo ante un 422', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(await screen.findByLabelText('Correo electrónico'), 'admin@nz.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Credenciales inválidas.')).toBeInTheDocument();
  });

  it('muestra un toast ante rate limit 429', async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ message: 'Too many requests' }, { status: 429 }),
      ),
    );
    const user = userEvent.setup();
    renderLogin();

    await user.type(await screen.findByLabelText('Correo electrónico'), 'admin@nz.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() =>
      expect(screen.getByText(/Demasiados intentos/i)).toBeInTheDocument(),
    );
  });
});
