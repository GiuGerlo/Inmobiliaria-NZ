import { useState } from 'react';
import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './SidebarNav';
import { UserMenu } from './UserMenu';
import { MadeByGerlo } from '@/components/MadeByGerlo';

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

  return (
    <div className="flex min-h-svh">
      {/* Sidebar escritorio */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar md:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto pb-4">
          <SidebarNav />
        </div>
        <div className="border-t border-sidebar-border px-5 py-4">
          <MadeByGerlo variant="dark" orientation="horizontal" />
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
