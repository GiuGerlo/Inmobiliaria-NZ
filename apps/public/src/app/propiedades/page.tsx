import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { PropertiesExplorer } from '@/components/PropertiesExplorer';
import { PageHeader } from '@/components/PageHeader';
import { fetchAllSaleProperties, fetchPropertyTypes } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Propiedades en venta',
  description:
    'Descubrí nuestra selección de propiedades en venta en Guatimozín y zona: casas, terrenos, locales, quintas y más.',
  alternates: { canonical: '/propiedades' },
};

export default async function PropiedadesPage() {
  const [properties, types] = await Promise.all([
    fetchAllSaleProperties(),
    fetchPropertyTypes(),
  ]);
  const available = properties.filter((p) => !p.is_sold);

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Nuestra cartera"
          title="Propiedades en venta"
          subtitle="Una amplia variedad de opciones para encontrar la propiedad perfecta para vos."
        />
        <section className="relative overflow-hidden bg-cream pb-24">
          <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-gold/8 blur-[100px]" />
          <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-navy/4 blur-[80px]" />
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Suspense fallback={<div className="h-40" />}>
              <PropertiesExplorer properties={available} types={types} />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
