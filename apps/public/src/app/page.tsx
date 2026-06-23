import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { Hero } from '@/components/home/Hero';
import { Capua } from '@/components/home/Capua';
import { Stats } from '@/components/home/Stats';
import { About } from '@/components/home/About';
import { Categories } from '@/components/home/Categories';
import { PropertiesMap } from '@/components/home/PropertiesMap';
import { Contact } from '@/components/home/Contact';
import { fetchAllSaleProperties, fetchPropertyTypes } from '@/lib/api';

export default async function HomePage() {
  const [properties, types] = await Promise.all([
    fetchAllSaleProperties(),
    fetchPropertyTypes(),
  ]);

  const soldCount = properties.filter((p) => p.is_sold).length;
  const localities = new Set(
    properties.map((p) => p.locality).filter((l): l is string => Boolean(l)),
  ).size;
  const stats = [
    { value: 5, prefix: '+', label: 'Años de experiencia' },
    { value: properties.length, label: 'Propiedades' },
    { value: soldCount, label: 'Operaciones cerradas' },
    { value: localities, label: 'Localidades' },
  ];

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Capua />
        <Stats stats={stats} />
        <About />
        <Categories types={types} />
        <PropertiesMap properties={properties} />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
