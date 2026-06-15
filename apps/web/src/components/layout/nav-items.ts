import {
  Building2,
  FileText,
  Home,
  MapPin,
  Receipt,
  Users,
  UserSquare,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  enabled: boolean;
};

/** Secciones del dominio. Solo Ciudades está activa en sub-E; el resto llega en E2+. */
export const navItems: NavItem[] = [
  { label: 'Recibos', to: '/recibos', icon: Receipt, enabled: true },
  { label: 'Contratos', to: '/contratos', icon: FileText, enabled: true },
  { label: 'Propiedades', to: '/propiedades', icon: Home, enabled: true },
  { label: 'Ciudades', to: '/ciudades', icon: MapPin, enabled: true },
  { label: 'Inquilinos', to: '/inquilinos', icon: Users, enabled: true },
  { label: 'Dueños', to: '/duenos', icon: UserSquare, enabled: true },
  { label: 'Formas de pago', to: '/formas-pago', icon: Building2, enabled: true },
];
