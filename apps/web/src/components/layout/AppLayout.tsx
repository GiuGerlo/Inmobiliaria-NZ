import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { Menu, PanelLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SidebarNav } from './SidebarNav';
import { UserMenu } from './UserMenu';
import { MadeByGerlo } from '@/components/MadeByGerlo';

const SIDEBAR_KEY = 'nz-sidebar-collapsed';

function Brand() {
  return (
    <div className="flex items-center gap-2 px-5 py-5">
      <img src="/logo-nz.jpg" alt="" className="size-9 rounded-md" />
      <span className="text-sm font-semibold leading-tight text-sidebar-foreground">
        Inmobiliaria NZ
      </span>
    </div>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === '1');

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className="flex min-h-svh">
      {/* Sidebar escritorio — colapsable con transición de ancho */}
      <aside
        className={cn(
          'hidden shrink-0 overflow-hidden bg-sidebar transition-[width] duration-300 ease-in-out motion-reduce:transition-none md:flex',
          collapsed ? 'md:w-0' : 'md:w-64',
        )}
      >
        {/* Contenido de ancho fijo: se clippea al colapsar en vez de reflowear. */}
        <div className="flex h-full w-64 flex-1 flex-col">
          <Brand />
          <div className="flex-1 overflow-y-auto pb-4">
            <SidebarNav />
          </div>
          <div className="border-t border-sidebar-border px-5 py-4">
            <MadeByGerlo variant="dark" orientation="horizontal" />
          </div>
        </div>
      </aside>

      {/* Drawer mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-64 flex-col border-0 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <Brand />
          <div className="flex-1 overflow-y-auto">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="border-t border-sidebar-border px-5 py-4">
            <MadeByGerlo variant="dark" orientation="horizontal" />
          </div>
        </SheetContent>
      </Sheet>

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-2 border-b bg-card px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Mostrar menú' : 'Ocultar menú'}
              aria-pressed={collapsed}
            >
              <PanelLeft className="size-5" />
            </Button>
          </div>
          <UserMenu />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
