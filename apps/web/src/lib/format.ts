const currencyFormatter = new Intl.NumberFormat('es-AR');

/** Entero en pesos → "$ 120.000" (formato es-AR). */
export function formatCurrency(value: number): string {
  return `$ ${currencyFormatter.format(value)}`;
}
