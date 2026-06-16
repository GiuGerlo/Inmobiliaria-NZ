import type { ColumnDef } from '@tanstack/react-table';
import { Eye, FileSpreadsheet, FileText, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { formatCurrency, formatDate } from '@/lib/format';
import { openReceiptPdf, openSettlementPdf } from './pdf';
import type { Receipt } from './types';

type ReceiptActions = {
  onDetail: (receipt: Receipt) => void;
  onEdit: (receipt: Receipt) => void;
  onDelete: (receipt: Receipt) => void;
};

/** Etiqueta del contrato: "Dueño - Inquilino" (espejo del legacy). */
function contractLabel(receipt: Receipt): string {
  const owner = receipt.contract?.owner?.name;
  const tenant = receipt.contract?.tenant?.name;
  if (owner && tenant) return `${owner} - ${tenant}`;
  return owner ?? tenant ?? '—';
}

/** Columnas de montos en pesos (clave del campo + encabezado corto). */
const AMOUNT_COLUMNS: Array<{ key: keyof Receipt; header: string }> = [
  { key: 'property_amount', header: 'Pago' },
  { key: 'municipal_amount', header: 'Mun.' },
  { key: 'water_amount', header: 'Agua' },
  { key: 'electricity_amount', header: 'Electr.' },
  { key: 'gas_amount', header: 'Gas' },
  { key: 'repairs_amount', header: 'Arreglo' },
  { key: 'funeral_amount', header: 'Otros' },
  { key: 'fees_amount', header: 'Honor.' },
];

export function buildReceiptColumns({ onDetail, onEdit, onDelete }: ReceiptActions): ColumnDef<Receipt>[] {
  const amountColumns: ColumnDef<Receipt>[] = AMOUNT_COLUMNS.map(({ key, header }) => ({
    id: key,
    enableSorting: false,
    header: () => <div className="text-right">{header}</div>,
    cell: ({ row }) => {
      const value = row.original[key] as number;
      return (
        <div className="text-right tabular-nums whitespace-nowrap">
          {value > 0 ? formatCurrency(value) : <span className="text-muted-foreground">—</span>}
        </div>
      );
    },
  }));

  return [
    {
      id: 'number',
      accessorKey: 'number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nº" />,
      cell: ({ row }) => `#${row.original.number}`,
    },
    {
      id: 'contract',
      enableSorting: false,
      header: 'Contrato',
      accessorFn: contractLabel,
    },
    {
      id: 'payment_method',
      enableSorting: false,
      header: 'FP',
      accessorFn: (row) => row.payment_method?.description ?? '—',
    },
    {
      id: 'paid_at',
      accessorKey: 'paid_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
      cell: ({ row }) => formatDate(row.original.paid_at),
    },
    {
      id: 'month',
      enableSorting: false,
      header: 'Mes',
      accessorKey: 'month',
    },
    {
      id: 'year',
      accessorKey: 'year',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Año" />,
    },
    ...amountColumns,
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const receipt = row.original;
        return (
          <div className="flex items-center justify-end gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-[#13294b] hover:text-[#13294b]"
                  aria-label={`Ver detalle del recibo #${receipt.number}`}
                  onClick={() => onDetail(receipt)}
                >
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver detalle</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-emerald-700 hover:text-emerald-800"
                  aria-label={`Recibo PDF del recibo #${receipt.number}`}
                  onClick={() => openReceiptPdf(receipt.number)}
                >
                  <FileText className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recibo PDF</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-sky-700 hover:text-sky-800"
                  aria-label={`Rendición PDF del recibo #${receipt.number}`}
                  onClick={() => openSettlementPdf(receipt.number)}
                >
                  <FileSpreadsheet className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rendición PDF</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label={`Acciones del recibo #${receipt.number}`}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(receipt)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(receipt)}>
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
