import type { Receipt } from './types';

/**
 * Total del recibo: alquiler + servicios + honorarios.
 * NO incluye arreglos/otros (esos impactan la rendición, no el total al inquilino).
 * Espejo de `App\Support\ReceiptCalculator::receiptTotal` del backend.
 */
export function receiptTotal(receipt: Receipt): number {
  return (
    receipt.property_amount +
    receipt.municipal_amount +
    receipt.water_amount +
    receipt.electricity_amount +
    receipt.gas_amount +
    receipt.fees_amount
  );
}
