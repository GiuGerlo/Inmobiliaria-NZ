import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { AppProviders } from './app/providers';
import { router } from './app/router';
import { setUnauthorizedHandler } from './lib/api';
import { queryClient } from './lib/query-client';

// Sesión expirada (401 fuera del login): limpiar cache y volver al login.
setUnauthorizedHandler(() => {
  queryClient.clear();
  void router.navigate('/login');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
