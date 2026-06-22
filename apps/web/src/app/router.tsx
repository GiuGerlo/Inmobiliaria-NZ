import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RequireSuperadmin } from '@/features/auth/RequireSuperadmin';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CitiesPage } from '@/features/cities/CitiesPage';
import { PaymentMethodsPage } from '@/features/payment-methods/PaymentMethodsPage';
import { OwnersPage } from '@/features/owners/OwnersPage';
import { TenantsPage } from '@/features/tenants/TenantsPage';
import { PropertiesPage } from '@/features/properties/PropertiesPage';
import { ContractsPage } from '@/features/contracts/ContractsPage';
import { ReceiptsPage } from '@/features/receipts/ReceiptsPage';
import { RemindersPage } from '@/features/whatsapp/RemindersPage';
import { SalesPropertiesPage } from '@/features/sales-properties/SalesPropertiesPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'ciudades', element: <CitiesPage /> },
          { path: 'formas-pago', element: <PaymentMethodsPage /> },
          { path: 'duenos', element: <OwnersPage /> },
          { path: 'inquilinos', element: <TenantsPage /> },
          { path: 'propiedades', element: <PropertiesPage /> },
          { path: 'contratos', element: <ContractsPage /> },
          { path: 'recibos', element: <ReceiptsPage /> },
          { path: 'recordatorios', element: <RemindersPage /> },
          {
            element: <RequireSuperadmin />,
            children: [{ path: 'propiedades-venta', element: <SalesPropertiesPage /> }],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
