import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { PageHeader } from '@/components/PageHeader';
import { PropertyCard } from '@/components/PropertyCard';
import { fetchAllSaleProperties } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Propiedades vendidas',
  description: 'Historial de propiedades que vendimos exitosamente en Guatimozín y zona.',
  alternates: { canonical: '/vendidas' },
};

export default async function VendidasPage() {
  const properties = await fetchAllSaleProperties();
  const sold = properties.filter((p) => p.is_sold);

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Trayectoria"
          title="Propiedades vendidas"
          subtitle="Historial de propiedades que vendimos exitosamente."
        />
        <section className="bg-cream pb-24 pt-14">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            {sold.length > 0 ? (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {sold.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <div className="grid place-items-center py-16 text-center text-muted">
                <CheckCircle2 size={40} className="text-navy/20" />
                <p className="mt-4 font-display text-lg text-ink">
                  No hay propiedades vendidas para mostrar
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
