import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { CitiesPage } from '@/features/cities/CitiesPage';
import { PaymentMethodsPage } from '@/features/payment-methods/PaymentMethodsPage';
import { OwnersPage } from '@/features/owners/OwnersPage';
import { TenantsPage } from '@/features/tenants/TenantsPage';
import { PropertiesPage } from '@/features/properties/PropertiesPage';
import { ContractsPage } from '@/features/contracts/ContractsPage';

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
          { path: 'formas-pago', element: <PaymentMethodsPage /> },
          { path: 'duenos', element: <OwnersPage /> },
          { path: 'inquilinos', element: <TenantsPage /> },
          { path: 'propiedades', element: <PropertiesPage /> },
          { path: 'contratos', element: <ContractsPage /> },
          { path: '*', element: <Navigate to="/ciudades" replace /> },
        ],
      },
    ],
  },
]);
