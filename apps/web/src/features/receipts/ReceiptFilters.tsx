import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityCombobox } from '@/components/form/EntityCombobox';
import { fetchContractOptions } from '@/features/contracts/api';
import { fetchPaymentMethodOptions } from '@/features/payment-methods/api';
import { MONTHS } from './schema';
import { emptyReceiptFilters, type ReceiptFilters as Filters } from './types';

type ReceiptFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

function countActive(filters: Filters): number {
  let count = 0;
  if (filters.contractId !== null) count++;
  if (filters.paymentMethodId !== null) count++;
  if (filters.month !== 'all') count++;
  if (filters.year) count++;
  return count;
}

export function ReceiptFilters({ filters, onChange }: ReceiptFiltersProps) {
  const active = countActive(filters);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ListFilter className="size-4" />
          Filtros
          {active > 0 && (
            <Badge className="ml-1 size-5 justify-center rounded-full p-0 text-xs">{active}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Filtrar recibos</p>
          {active > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onChange(emptyReceiptFilters)}
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-contract">Contrato</Label>
          <EntityCombobox
            id="filter-contract"
            name="contracts"
            value={filters.contractId}
            onChange={(v) => onChange({ ...filters, contractId: v })}
            fetchOptions={fetchContractOptions}
            placeholder="Todos"
            searchPlaceholder="Buscar contrato…"
            emptyMessage="Sin resultados."
            clearable
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-payment-method">Forma de pago</Label>
          <EntityCombobox
            id="filter-payment-method"
            name="payment-methods"
            value={filters.paymentMethodId}
            onChange={(v) => onChange({ ...filters, paymentMethodId: v })}
            fetchOptions={fetchPaymentMethodOptions}
            placeholder="Todas"
            searchPlaceholder="Buscar forma de pago…"
            emptyMessage="Sin resultados."
            clearable
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Mes</Label>
            <Select
              value={filters.month}
              onValueChange={(value) => onChange({ ...filters, month: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-year">Año</Label>
            <Input
              id="filter-year"
              type="number"
              min={2000}
              max={2100}
              placeholder="Todos"
              value={filters.year}
              onChange={(e) => onChange({ ...filters, year: e.target.value })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
