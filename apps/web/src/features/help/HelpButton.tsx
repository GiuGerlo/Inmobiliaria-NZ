import { CircleHelp, Lightbulb } from 'lucide-react';
import { useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { HELP } from './content';

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

/**
 * Botón "Ayuda" de la barra superior: abre un panel con qué se hace en la pantalla actual
 * y ejemplos paso a paso. Si la ruta no tiene ayuda cargada, no se muestra.
 */
export function HelpButton() {
  const { pathname } = useLocation();
  const help = HELP[pathname];
  if (!help) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Ayuda de esta página">
          <CircleHelp className="size-4" />
          <span className="hidden sm:inline">Ayuda</span>
        </Button>
      </SheetTrigger>
      {/* Pantalla completa en celular; panel lateral en escritorio. */}
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4 pr-12">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <CircleHelp className="size-5 text-[#c5a572]" />
            Ayuda: {help.title}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">{help.purpose}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-5 py-5 text-sm leading-relaxed">
          <section>
            <SectionTitle>Qué podés hacer acá</SectionTitle>
            <ul className="list-disc space-y-1 pl-5">
              {help.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle>Paso a paso</SectionTitle>
            <div className="space-y-3">
              {help.examples.map((ex) => (
                <div key={ex.title} className="rounded-lg border bg-muted/40 p-3">
                  <p className="mb-2 font-medium">{ex.title}</p>
                  <ol className="list-decimal space-y-1 pl-5">
                    {ex.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          {help.tips && (
            <section>
              <SectionTitle>Tips</SectionTitle>
              <ul className="space-y-2">
                {help.tips.map((t) => (
                  <li key={t} className="flex gap-2 rounded-lg border-l-2 border-[#c5a572] bg-[#f4f1ea] px-3 py-2">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#c5a572]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
