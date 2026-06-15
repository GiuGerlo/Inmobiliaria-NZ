import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type DataTableToolbarProps = {
  /** Si se omite, no se muestra el campo de búsqueda (recurso sin ?q). */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Filtros adicionales (selects, etc.). */
  filters?: ReactNode;
  /** Acciones a la derecha (p. ej. botón "Nuevo"). */
  actions?: ReactNode;
};

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  filters,
  actions,
}: DataTableToolbarProps) {
  const showSearch = search !== undefined && onSearchChange;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {showSearch && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
              aria-label="Buscar"
            />
          </div>
        )}
        {filters}
      </div>
      {actions}
    </div>
  );
}
