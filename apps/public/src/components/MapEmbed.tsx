import { sanitizeMapEmbed } from '@/lib/sanitizeMapEmbed';

/**
 * Renderiza el mapa de una propiedad de forma segura: NO inyecta el HTML del
 * admin; valida el `src` contra la allowlist y arma nuestro propio <iframe>.
 */
export function MapEmbed({ value, title }: { value: string | null; title?: string }) {
  const src = sanitizeMapEmbed(value);
  if (!src) return null;

  return (
    <div className="overflow-hidden rounded-card border border-navy/10 shadow-soft">
      <iframe
        src={src}
        title={title ?? 'Ubicación en Google Maps'}
        width="100%"
        height={400}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
      />
    </div>
  );
}
