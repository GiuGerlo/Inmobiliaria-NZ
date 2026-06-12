import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { CitiesPage } from '@/features/cities/CitiesPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/ciudades" replace /> },
          { path: 'ciudades', element: <CitiesPage /> },
          { path: '*', element: <Navigate to="/ciudades" replace /> },
        ],
      },
    ],
  },
]);
