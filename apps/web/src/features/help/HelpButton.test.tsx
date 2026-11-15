import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { navItems } from '@/components/layout/nav-items';
import { HelpButton } from './HelpButton';
import { HELP } from './content';

describe('Ayuda por página', () => {
  it('abre el panel con el propósito, las acciones y ejemplos paso a paso', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HelpButton />, { route: '/recibos' });

    await user.click(screen.getByRole('button', { name: 'Ayuda de esta página' }));
    const panel = await screen.findByRole('dialog');

    expect(within(panel).getByText('Ayuda: Recibos')).toBeInTheDocument();
    expect(within(panel).getByText('Qué podés hacer acá')).toBeInTheDocument();
    expect(within(panel).getByText('Cargar el pago de un inquilino')).toBeInTheDocument();
    expect(within(panel).getByText('Tocá "Nuevo recibo".')).toBeInTheDocument();
  });

  it('no muestra el botón en una ruta sin ayuda', () => {
    renderWithProviders(<HelpButton />, { route: '/ruta-inexistente' });
    expect(screen.queryByRole('button', { name: 'Ayuda de esta página' })).not.toBeInTheDocument();
  });

  it('toda sección del menú tiene su ayuda cargada', () => {
    const missing = navItems.filter((item) => !HELP[item.to]).map((item) => item.to);
    expect(missing).toEqual([]);
  });
});
