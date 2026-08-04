import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RequireSuperadmin } from '@/features/auth/RequireSuperadmin';

const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const CitiesPage = lazy(() =>
  import('@/features/cities/CitiesPage').then((m) => ({ default: m.CitiesPage }))
);
const PaymentMethodsPage = lazy(() =>
  import('@/features/payment-methods/PaymentMethodsPage').then((m) => ({ default: m.PaymentMethodsPage }))
);
const OwnersPage = lazy(() =>
  import('@/features/owners/OwnersPage').then((m) => ({ default: m.OwnersPage }))
);
const TenantsPage = lazy(() =>
  import('@/features/tenants/TenantsPage').then((m) => ({ default: m.TenantsPage }))
);
const PropertiesPage = lazy(() =>
  import('@/features/properties/PropertiesPage').then((m) => ({ default: m.PropertiesPage }))
);
const ContractsPage = lazy(() =>
  import('@/features/contracts/ContractsPage').then((m) => ({ default: m.ContractsPage }))
);
const ReceiptsPage = lazy(() =>
  import('@/features/receipts/ReceiptsPage').then((m) => ({ default: m.ReceiptsPage }))
);
const RemindersPage = lazy(() =>
  import('@/features/whatsapp/RemindersPage').then((m) => ({ default: m.RemindersPage }))
);
const SalesPropertiesPage = lazy(() =>
  import('@/features/sales-properties/SalesPropertiesPage').then((m) => ({ default: m.SalesPropertiesPage }))
);
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const MaintenancePage = lazy(() =>
  import('@/features/maintenance/MaintenancePage').then((m) => ({ default: m.MaintenancePage }))
);
const UsersPage = lazy(() =>
  import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage }))
);

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
          { path: 'perfil', element: <ProfilePage /> },
          {
            element: <RequireSuperadmin />,
            children: [
              { path: 'propiedades-venta', element: <SalesPropertiesPage /> },
              { path: 'mantenimiento', element: <MaintenancePage /> },
              { path: 'usuarios', element: <UsersPage /> },
            ],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
