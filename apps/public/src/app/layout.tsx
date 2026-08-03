import type { Metadata } from 'next';
import { Poppins, Fraunces } from 'next/font/google';
import { site, businessJsonLd, jsonLdString } from '@/lib/site';
import { Preloader } from '@/components/Preloader';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { gaId } from '@/lib/analytics';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  keywords: [
    'inmobiliaria guatimozín',
    'propiedades córdoba',
    'casas en venta',
    'terrenos',
    'locales comerciales',
    'Nadina Zaranich',
  ],
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    images: [{ url: '/img/opengraph.jpg', width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: '/img/favicon.ico',
    apple: '/img/logo.png',
  },
  manifest: '/site.webmanifest',
  // Verificación de dominio de Meta (Business Manager) — meta tag estática en el <head>.
  verification: {
    other: {
      'facebook-domain-verification': 'kvctchkby7i6ntp82kw9w57ogodv2a',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${fraunces.variable}`}>
      {/* suppressHydrationWarning: extensiones del navegador (ColorZilla, Grammarly…)
          inyectan atributos en <body> antes de hidratar — no es un mismatch nuestro. */}
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(businessJsonLd()) }}
        />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Preloader />
        {children}
      </body>
    </html>
  );
}
