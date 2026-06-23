import { describe, it, expect } from 'vitest';
import { sanitizeMapEmbed } from './sanitizeMapEmbed';

const VALID_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3';

describe('sanitizeMapEmbed', () => {
  it('extrae el src de un iframe de Google Maps válido', () => {
    const iframe = `<iframe src="${VALID_SRC}" width="100%" height="500" allowfullscreen></iframe>`;
    expect(sanitizeMapEmbed(iframe)).toBe(VALID_SRC);
  });

  it('acepta una URL de embed suelta (sin iframe)', () => {
    expect(sanitizeMapEmbed(VALID_SRC)).toBe(VALID_SRC);
  });

  it('decodifica entidades del legacy (&amp;, \\")', () => {
    const stored = `<iframe src=\\"https://www.google.com/maps/embed?pb=1&amp;foo=bar\\"></iframe>`;
    expect(sanitizeMapEmbed(stored)).toBe('https://www.google.com/maps/embed?pb=1&foo=bar');
  });

  it('rechaza javascript: en el src', () => {
    expect(sanitizeMapEmbed(`<iframe src="javascript:alert(1)"></iframe>`)).toBeNull();
  });

  it('rechaza un host que no es Google Maps', () => {
    expect(sanitizeMapEmbed(`<iframe src="https://evil.com/maps/embed?pb=1"></iframe>`)).toBeNull();
  });

  it('rechaza un path de Google que no es /maps/embed', () => {
    expect(sanitizeMapEmbed(`<iframe src="https://www.google.com/search?q=x"></iframe>`)).toBeNull();
  });

  it('rechaza intentos de path traversal fuera de /maps/embed', () => {
    expect(
      sanitizeMapEmbed(`<iframe src="https://www.google.com/maps/embed/../evil"></iframe>`),
    ).toBeNull();
  });

  it('ignora atributos peligrosos: solo toma el src', () => {
    const iframe = `<iframe onload="steal()" src="${VALID_SRC}" onerror="x()"></iframe>`;
    expect(sanitizeMapEmbed(iframe)).toBe(VALID_SRC);
  });

  it('devuelve null para HTML sin src válido', () => {
    expect(sanitizeMapEmbed('<script>alert(1)</script>')).toBeNull();
  });

  it('devuelve null para vacío o null', () => {
    expect(sanitizeMapEmbed(null)).toBeNull();
    expect(sanitizeMapEmbed('')).toBeNull();
    expect(sanitizeMapEmbed('   ')).toBeNull();
  });
});
