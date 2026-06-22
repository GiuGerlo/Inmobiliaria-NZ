import {
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Receipt,
  Store,
  Users,
  UserSquare,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  enabled: boolean;
  superadminOnly?: boolean;
};

/** Secciones del dominio. Solo Ciudades está activa en sub-E; el resto llega en E2+. */
export const navItems: NavItem[] = [
  { label: 'Inicio', to: '/', icon: LayoutDashboard, enabled: true },
  { label: 'Recibos', to: '/recibos', icon: Receipt, enabled: true },
  { label: 'Recordatorios', to: '/recordatorios', icon: MessageCircle, enabled: true },
  { label: 'Contratos', to: '/contratos', icon: FileText, enabled: true },
  { label: 'Propiedades', to: '/propiedades', icon: Home, enabled: true },
  {
    label: 'Propiedades en venta',
    to: '/propiedades-venta',
    icon: Store,
    enabled: true,
    superadminOnly: true,
  },
  { label: 'Ciudades', to: '/ciudades', icon: MapPin, enabled: true },
  { label: 'Inquilinos', to: '/inquilinos', icon: Users, enabled: true },
  { label: 'Dueños', to: '/duenos', icon: UserSquare, enabled: true },
  { label: 'Formas de pago', to: '/formas-pago', icon: Building2, enabled: true },
];
