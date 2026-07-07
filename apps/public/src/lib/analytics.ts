/**
 * Google Analytics 4 — helpers. El ID llega por `NEXT_PUBLIC_GA_ID`, seteado solo en el build de
 * producción (ver deploy-public.yml) → en dev/local `gaId` es undefined y no se carga nada.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const gaId = process.env.NEXT_PUBLIC_GA_ID;

/** Evento de conversión: click en un CTA de WhatsApp. `location` = de dónde salió (floating/contact/property). */
export function trackWhatsApp(location: string): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'whatsapp_click', { location });
  }
}
