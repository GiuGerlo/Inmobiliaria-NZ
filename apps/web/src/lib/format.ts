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
