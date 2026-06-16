/**
 * Helpers para abrir los PDFs de recibos en una pestaña nueva.
 *
 * Son endpoints GET bajo `auth:sanctum`; al navegar en el mismo dominio (:8080)
 * la cookie de sesión viaja sola, así que alcanza con `window.open` a la URL.
 */
const API = '/api/v1';

export function openReceiptPdf(number: number): void {
  window.open(`${API}/receipts/${number}/pdf`, '_blank', 'noopener');
}

export function openSettlementPdf(number: number): void {
  window.open(`${API}/receipts/${number}/settlement`, '_blank', 'noopener');
}

export function openMonthlyReport(month: string, year: number): void {
  const params = new URLSearchParams({ month, year: String(year) });
  window.open(`${API}/reports/monthly-payments?${params.toString()}`, '_blank', 'noopener');
}
