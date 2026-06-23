import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-navy px-5 text-center text-cream">
      <div>
        <p className="font-display text-7xl text-gold">404</p>
        <h1 className="mt-4 font-display text-3xl">Página no encontrada</h1>
        <p className="mt-3 text-cream/70">La propiedad o sección que buscás no existe.</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy transition-transform hover:scale-[1.03]"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
