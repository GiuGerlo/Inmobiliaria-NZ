import { describe, it, expect } from 'vitest';
import { jsonLdString, whatsappLink } from './site';

describe('jsonLdString', () => {
  it('escapa < para que un valor no pueda romper el bloque <script>', () => {
    const out = jsonLdString({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c');
    // sigue siendo JSON válido y deserializa al valor original
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('whatsappLink', () => {
  it('codifica el texto en el query', () => {
    expect(whatsappLink('Hola & chau')).toContain('?text=Hola%20%26%20chau');
  });
});
