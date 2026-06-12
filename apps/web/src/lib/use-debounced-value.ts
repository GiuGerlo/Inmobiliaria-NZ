import { useEffect, useState } from 'react';

/** Devuelve `value` con un retraso de `delay` ms (para no spamear la API al tipear). */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
