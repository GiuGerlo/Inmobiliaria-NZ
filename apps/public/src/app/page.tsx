import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { Hero } from '@/components/home/Hero';
import { Capua } from '@/components/home/Capua';
import { About } from '@/components/home/About';
import { Categories } from '@/components/home/Categories';
import { PropertiesMap } from '@/components/home/PropertiesMap';
import { Contact } from '@/components/home/Contact';
import { fetchAllSaleProperties, fetchPropertyTypes } from '@/lib/api';

export const metadata: Metadata = {
  title: { absolute: site.name },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: site.name,
    description: site.description,
    images: [{ url: '/img/opengraph.jpg', width: 1200, height: 630, alt: site.name }],
  },
};

export default async function HomePage() {
  const [properties, types] = await Promise.all([
    fetchAllSaleProperties(),
    fetchPropertyTypes(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Capua />
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
