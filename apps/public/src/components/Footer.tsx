import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import { site, whatsappLink } from '@/lib/site';

const quickLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/#capua', label: 'Capua' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/vendidas', label: 'Vendidas' },
  { href: '/#contacto', label: 'Contacto' },
];

export function Footer() {
  return (
    <footer className="bg-navy text-cream/70">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <Image src="/img/logo.png" alt="NZ Estudio" width={56} height={56} className="h-14 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Expertos en derecho con un enfoque personalizado para cada cliente. Compra, venta y
            asesoramiento jurídico-inmobiliario.
          </p>
        </div>

        <div>
          <h3 className="font-display text-base text-cream">Navegación</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base text-cream">Contacto</h3>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                {site.address.street}, {site.address.city}, {site.address.region}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-gold" />
              <a href={whatsappLink()} className="transition-colors hover:text-gold">
                {site.phone.display}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-gold" />
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-gold">
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base text-cream">Horarios</h3>
          <p className="mt-5 flex items-start gap-3 text-sm">
            <Clock size={18} className="mt-0.5 shrink-0 text-gold" />
            <span>{site.hours}</span>
          </p>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-gold"
          >
            <Instagram size={18} className="text-gold" /> @nadinazaranich_estudio
          </a>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-cream/50 sm:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
          </p>
          <a
            href={site.developer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span>Desarrollado por</span>
            <Image
              src="/img/logo-secundario.svg"
              alt={site.developer.name}
              width={90}
              height={28}
              className="h-6 w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
