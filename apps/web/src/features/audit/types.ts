export type AuditLog = {
  id: number;
  created_at: string | null;
  event: string;
  user_id: number | null;
  user_name: string | null;
  auditable_type: string | null;
  auditable_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
};

export type AuditFilters = {
  userId?: string;
  event?: string;
  type?: string;
  from?: string;
  to?: string;
};

/** Acciones filtrables. "whatsapp" y "pdf" agrupan todos sus subtipos (el backend filtra por prefijo). */
export const EVENT_FILTERS: Record<string, string> = {
  created: 'Alta',
  updated: 'Modificación',
  deleted: 'Baja',
  login: 'Ingreso',
  logout: 'Salida',
  login_failed: 'Ingreso fallido',
  whatsapp: 'Envío por WhatsApp',
  pdf: 'PDF',
};

const EVENT_LABEL: Record<string, string> = {
  ...EVENT_FILTERS,
  'whatsapp.recibo': 'WhatsApp: recibo',
  'whatsapp.rendicion': 'WhatsApp: rendición',
  'whatsapp.recordatorio_pago': 'WhatsApp: recordatorio de pago',
  'whatsapp.recordatorio_faltante': 'WhatsApp: aviso de faltante',
  'pdf.recibo': 'PDF del recibo',
  'pdf.rendicion': 'PDF de la rendición',
};

export const TYPE_LABEL: Record<string, string> = {
  Contract: 'Contrato',
  Receipt: 'Recibo',
  Owner: 'Dueño',
  Tenant: 'Inquilino',
  Property: 'Propiedad',
  City: 'Ciudad',
  PaymentMethod: 'Forma de pago',
  SaleProperty: 'Propiedad en venta',
  PropertyImage: 'Foto de propiedad en venta',
  PropertyType: 'Tipo de propiedad',
  User: 'Usuario',
  Setting: 'Configuración',
  WhatsAppMessage: 'Mensaje de WhatsApp',
};

export function eventLabel(event: string): string {
  return EVENT_LABEL[event] ?? event;
}

export function subjectLabel(log: AuditLog): string {
  if (!log.auditable_type) return '—';
  const type = TYPE_LABEL[log.auditable_type] ?? log.auditable_type;
  return log.auditable_id ? `${type} #${log.auditable_id}` : type;
}
