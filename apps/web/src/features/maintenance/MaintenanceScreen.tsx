import { Wrench } from 'lucide-react';
import { useLogout } from '@/features/auth/useAuth';

export function MaintenanceScreen() {
  const logout = useLogout();

  return (
    <div
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-8 text-center"
      style={{ background: '#05172d' }}
    >
      {/* Dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(197,165,114,0.06) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      {/* Radial glow top */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: '500px',
          height: '320px',
          background: 'radial-gradient(ellipse at top, rgba(197,165,114,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Icon + animated rings */}
        <div className="relative flex size-24 items-center justify-center">
          <div
            className="absolute size-24 rounded-full border border-[#c5a572]/20 animate-pulse"
            style={{ animationDuration: '3s' }}
          />
          <div className="absolute size-16 rounded-full border border-[#c5a572]/10" />
          <div
            className="flex size-12 items-center justify-center rounded-full"
            style={{ background: 'rgba(197,165,114,0.08)' }}
          >
            <Wrench className="size-5 text-[#c5a572]" />
          </div>
        </div>

        {/* Eyebrow label */}
        <p
          className="text-[10px] font-semibold uppercase text-[#c5a572]/50"
          style={{ letterSpacing: '0.28em' }}
        >
          Sistema
        </p>

        {/* Heading + body */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-white/90">
            En mantenimiento
          </h1>
          <p className="max-w-[22rem] text-sm leading-relaxed text-white/35">
            Estamos realizando mejoras en el sistema.
            <br />
            Volvé a intentar en unos minutos.
          </p>
        </div>

        {/* Gold divider */}
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-[#c5a572]/20" />
          <div className="size-1 rounded-full bg-[#c5a572]/30" />
          <div className="h-px w-8 bg-[#c5a572]/20" />
        </div>

        {/* Logout */}
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="text-xs text-white/25 transition-colors hover:text-white/55 disabled:opacity-50 disabled:pointer-events-none"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
