import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { App } from './App';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        service: 'inmobiliaria-api',
        ts: '2026-06-08T00:00:00Z',
      }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('renderiza la respuesta de health', async () => {
  render(<App />);
  await waitFor(() =>
    expect(screen.getByText(/API respondió/)).toBeInTheDocument(),
  );
  expect(screen.getByText(/ok/)).toBeInTheDocument();
});
