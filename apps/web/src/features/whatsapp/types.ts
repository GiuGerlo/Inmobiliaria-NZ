export type WhatsAppType = 'recibo' | 'rendicion' | 'recordatorio_pago' | 'recordatorio_faltante';
export type WhatsAppStatus = 'queued' | 'sent' | 'failed';

export type WhatsAppMessage = {
  id: number;
  batch_id: string | null;
  type: WhatsAppType;
  recipient_phone: string;
  recipient_name: string | null;
  body: string | null;
  status: WhatsAppStatus;
  error: string | null;
  sent_at: string | null;
  created_at: string | null;
};

export type BatchStatus = {
  batch_id: string;
  total: number;
  sent: number;
  failed: number;
  queued: number;
  messages: WhatsAppMessage[];
};

export type PaymentRemindersResult = {
  batch_id: string;
  total: number;
  skipped: string[];
};
