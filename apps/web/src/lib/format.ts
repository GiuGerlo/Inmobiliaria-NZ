const currencyFormatter = new Intl.NumberFormat('es-AR');

/** Entero en pesos → "$ 120.000" (formato es-AR). */
export function formatCurrency(value: number): string {
  return `$ ${currencyFormatter.format(value)}`;
}

/** Fecha ISO "YYYY-MM-DD" → "DD/MM/YYYY" (sin desfase de zona horaria). */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

/** Datetime ISO completo → "DD/MM/YYYY HH:mm" (hora local, formato 24 h). */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
