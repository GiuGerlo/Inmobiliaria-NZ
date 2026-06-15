import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { cn } from '@/lib/utils';

export type ComboboxOption<V extends string | number> = {
  value: V;
  label: string;
};

type EntityComboboxProps<V extends string | number> = {
  /** Namespace para la query key (ej. 'cities', 'owners'). */
  name: string;
  value: V | null;
  onChange: (value: V | null) => void;
  fetchOptions: (query: string) => Promise<ComboboxOption<V>[]>;
  /** Label del valor seleccionado al editar (antes de que carguen las opciones). */
  initialLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
};

/**
 * Selector de recurso relacionado (FK) con búsqueda server-side.
 * Genérico sobre el tipo del valor (string para códigos, number para ids).
 */
export function EntityCombobox<V extends string | number>({
  name,
  value,
  onChange,
  fetchOptions,
  initialLabel,
  placeholder = 'Seleccionar…',
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'Sin resultados.',
  disabled,
  id,
}: EntityComboboxProps<V>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ['combobox', name, debouncedSearch],
    queryFn: () => fetchOptions(debouncedSearch),
    enabled: open,
    staleTime: 30_000,
  });

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? (value !== null ? initialLabel : undefined);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !selectedLabel && 'text-muted-foreground')}
        >
          <span className="truncate">{selectedLabel ?? placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
          <CommandList>
            {isFetching && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Buscando…
              </div>
            )}
            {!isFetching && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={String(option.value)}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('size-4', option.value === value ? 'opacity-100' : 'opacity-0')}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
