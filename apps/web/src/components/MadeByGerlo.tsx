import { cn } from '@/lib/utils';

type MadeByGerloProps = {
  /** 'dark' = sobre fondo oscuro (sidebar navy); 'light' = sobre fondo claro (login). */
  variant?: 'dark' | 'light';
  /** 'horizontal' = label y logo en una línea; 'vertical' = apilados. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

/** Crédito del desarrollador — linkea a su web en una pestaña nueva. */
export function MadeByGerlo({
  variant = 'light',
  orientation = 'vertical',
  className,
}: MadeByGerloProps) {
  const logo = variant === 'dark' ? '/logo-original.svg' : '/logo-secundario.svg';
  const labelColor = variant === 'dark' ? 'text-sidebar-foreground/45' : 'text-muted-foreground';
  const isHorizontal = orientation === 'horizontal';

  return (
    <a
      href="https://giulianogerlo.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex transition-opacity',
        isHorizontal ? 'flex-row items-center gap-2' : 'flex-col gap-1',
        className,
      )}
    >
      <span
        className={cn(
          'whitespace-nowrap text-[10px] font-medium uppercase tracking-wider',
          labelColor,
        )}
      >
        Desarrollado por
      </span>
      <img
        src={logo}
        alt="Giuliano Gerlo"
        className="h-4 w-auto opacity-70 transition-opacity group-hover:opacity-100"
      />
    </a>
  );
}
