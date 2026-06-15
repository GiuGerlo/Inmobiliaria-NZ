import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZES = [10, 20, 30, 50];

export function DataTablePagination<TData>({
  table,
  total,
}: {
  table: Table<TData>;
  total: number;
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'resultado' : 'resultados'}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filas:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              table.setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize: Number(value) }))
            }
          >
            <SelectTrigger className="h-8 w-[4.5rem]" aria-label="Filas por página">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Página {pageCount === 0 ? 0 : pageIndex + 1} de {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
