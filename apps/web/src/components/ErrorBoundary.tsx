import * as Sentry from '@sentry/react';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 p-6 text-center">
          <p className="text-muted-foreground">
            Ocurrió un error inesperado en esta sección.
          </p>
          <button
            className="text-sm underline underline-offset-4 hover:text-primary"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      }
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
