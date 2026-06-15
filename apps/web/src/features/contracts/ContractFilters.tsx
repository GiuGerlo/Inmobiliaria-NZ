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
import { fetchOwnerOptions } from '@/features/owners/api';
import { fetchTenantOptions } from '@/features/tenants/api';
import { emptyContractFilters, type ContractFilters as Filters } from './types';

type ContractFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

function countActive(filters: Filters): number {
  let count = 0;
  if (filters.certification !== 'all') count++;
  if (filters.ownerId !== null) count++;
  if (filters.tenantId !== null) count++;
  if (filters.startFrom) count++;
  if (filters.startTo) count++;
  return count;
}

export function ContractFilters({ filters, onChange }: ContractFiltersProps) {
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
          <p className="text-sm font-medium">Filtrar contratos</p>
          {active > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onChange(emptyContractFilters)}
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Certificación</Label>
          <Select
            value={filters.certification}
            onValueChange={(value) =>
              onChange({ ...filters, certification: value as Filters['certification'] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Si">Certificados</SelectItem>
              <SelectItem value="No">Sin certificar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-owner">Dueño</Label>
          <EntityCombobox
            id="filter-owner"
            name="owners"
            value={filters.ownerId}
            onChange={(v) => onChange({ ...filters, ownerId: v })}
            fetchOptions={fetchOwnerOptions}
            placeholder="Todos"
            searchPlaceholder="Buscar dueño…"
            emptyMessage="Sin resultados."
            clearable
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-tenant">Inquilino</Label>
          <EntityCombobox
            id="filter-tenant"
            name="tenants"
            value={filters.tenantId}
            onChange={(v) => onChange({ ...filters, tenantId: v })}
            fetchOptions={fetchTenantOptions}
            placeholder="Todos"
            searchPlaceholder="Buscar inquilino…"
            emptyMessage="Sin resultados."
            clearable
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="start-from">Inicio desde</Label>
            <Input
              id="start-from"
              type="date"
              value={filters.startFrom}
              onChange={(e) => onChange({ ...filters, startFrom: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start-to">Inicio hasta</Label>
            <Input
              id="start-to"
              type="date"
              value={filters.startTo}
              onChange={(e) => onChange({ ...filters, startTo: e.target.value })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
