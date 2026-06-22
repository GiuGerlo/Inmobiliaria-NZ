import { describe, it, expect } from 'vitest';
import { reorder } from './reorder';

describe('reorder', () => {
  it('mueve un elemento hacia adelante y atrás', () => {
    expect(reorder(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(reorder(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('no cambia nada si from === to y no muta el original', () => {
    const list = ['a', 'b', 'c'];
    expect(reorder(list, 1, 1)).toBe(list);
    reorder(list, 0, 2);
    expect(list).toEqual(['a', 'b', 'c']);
  });
});
