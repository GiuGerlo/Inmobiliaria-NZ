'use client';

import { trackWhatsApp } from '@/lib/analytics';

/** Link a WhatsApp que reporta el click como evento GA (`whatsapp_click`). */
export function WhatsAppLink({
  href,
  location,
  className,
  children,
}: {
  href: string;
  location: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsApp(location)}
      className={className}
    >
      {children}
    </a>
  );
}
