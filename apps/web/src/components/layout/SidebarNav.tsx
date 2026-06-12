import { NavLink } from 'react-router';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';

/** Lista de navegación compartida por el sidebar de escritorio y el drawer mobile. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;

        if (!item.enabled) {
          return (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <span
                  aria-disabled
                  className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/40"
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">Próximamente</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary',
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
