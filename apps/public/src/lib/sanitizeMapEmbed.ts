// map_embed lo carga el admin (texto libre) → riesgo de stored-XSS.
// En vez de renderizar su HTML, extraemos SOLO el `src`, lo validamos contra una
// allowlist y reconstruimos nuestro propio <iframe> (ver MapEmbed.tsx).
// ponytail: allowlist de host/path, sin DOMPurify — un único origen no necesita una lib.

const ALLOWED_HOST = 'www.google.com';
const ALLOWED_PATH = '/maps/embed';

/** Desescapa las entidades/escapes que el legacy guardaba en el campo `mapa`. */
function decodeBasicEntities(value: string): string {
  return value
    .replace(/\\(["'])/g, '$1')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Devuelve la URL de embed de Google Maps si el input es seguro, o `null`.
 * Acepta tanto un `<iframe ... src="...">` completo como una URL suelta.
 */
export function sanitizeMapEmbed(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const decoded = decodeBasicEntities(raw).trim();
  const match = decoded.match(/src\s*=\s*["']([^"']+)["']/i);
  const candidate = match ? match[1] : decoded;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  if (url.hostname !== ALLOWED_HOST) return null;
  if (!url.pathname.startsWith(ALLOWED_PATH)) return null;

  return url.toString();
}
