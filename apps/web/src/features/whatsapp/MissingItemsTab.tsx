import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTenants } from '@/features/tenants/queries';
import type { Tenant } from '@/features/tenants/types';
import { MissingItemsDialog } from './MissingItemsDialog';

export function MissingItemsTab() {
  const { data, isLoading } = useTenants({ page: 1, perPage: 100 });
  const tenants = data?.data ?? [];
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState<Tenant | null>(null);

  const filtered = search.trim()
    ? tenants.filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()))
    : tenants;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recordatorio de faltantes</CardTitle>
        <CardDescription>Elegí un inquilino y componé qué le falta enviar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar inquilino…"
        />
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando inquilinos…</p>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto rounded-md border">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span className="flex-1">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.phone}</span>
                <Button variant="outline" size="sm" onClick={() => setTarget(t)}>
                  <MessageCircle className="size-4 text-emerald-600" />
                  Componer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <MissingItemsDialog
        key={target?.id ?? 'none'}
        tenant={target}
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
      />
    </Card>
  );
}
