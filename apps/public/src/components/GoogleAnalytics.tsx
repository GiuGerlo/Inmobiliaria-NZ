import Script from 'next/script';

/**
 * Carga GA4 (gtag.js) con `next/script`. Sin dependencias extra: para un export estático es un par
 * de tags. Se renderiza solo si hay `gaId` (prod). Ver lib/analytics.ts y deploy-public.yml.
 */
export function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
