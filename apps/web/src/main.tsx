import * as Sentry from '@sentry/react';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { AppProviders } from './app/providers';
import { router } from './app/router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader } from './components/PageLoader';
import { setUnauthorizedHandler } from './lib/api';
import { queryClient } from './lib/query-client';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
});

// Sesión expirada (401 fuera del login): limpiar cache y volver al login.
setUnauthorizedHandler(() => {
  queryClient.clear();
  void router.navigate('/login');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <Suspense fallback={<PageLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
