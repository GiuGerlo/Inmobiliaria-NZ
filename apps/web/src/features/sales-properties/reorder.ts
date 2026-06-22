/** Mueve el elemento de `from` a `to` devolviendo un array nuevo (no muta). */
export function reorder<T>(list: T[], from: number, to: number): T[] {
  if (from === to) return list;
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
