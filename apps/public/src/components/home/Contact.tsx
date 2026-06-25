import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { AnimatedText } from '@/components/AnimatedText';
import { site, whatsappLink } from '@/lib/site';

// Embed estático de la oficina (constante propia, no input del admin).
const OFFICE_MAP =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d989.5484013500621!2d-62.436690069800655!3d-33.46413275409658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95c8e7000f1771e7%3A0x394afa559eb65c26!2sEstudio%20Juridico%20-%20Nadina%20Zaranich!5e0!3m2!1ses-419!2sar!4v1715285017971!5m2!1ses-419!2sar';

const cards = [
  { icon: MapPin, label: 'Dirección', value: `${site.address.street}, ${site.address.city}, ${site.address.region}` },
  { icon: Phone, label: 'Teléfono', value: site.phone.display, href: whatsappLink() },
  { icon: Mail, label: 'Email', value: site.email, href: `mailto:${site.email}` },
  { icon: Clock, label: 'Horarios', value: site.hours },
];

export function Contact() {
  return (
    <section id="contacto" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Nuestro estudio
            </span>
            <AnimatedText
              as="h2"
              text="Visitanos o escribinos"
              className="mt-4 font-display text-4xl text-ink lg:text-5xl"
            />
            <p className="mt-5 text-muted">
              Estamos para asesorarte. Acercate a la oficina o contactanos para una consulta
              personalizada.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="rounded-card border border-navy/10 bg-cream p-6 shadow-soft"
                >
                  <c.icon size={22} className="text-gold" strokeWidth={1.5} />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
                    {c.label}
                  </p>
                  {c.href ? (
                    <a href={c.href} className="mt-1 block text-sm text-ink transition-colors hover:text-gold">
                      {c.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-ink">{c.value}</p>
                  )}
                </div>
              ))}

              <div className="flex gap-3 sm:col-span-2">
                <a
                  href={whatsappLink('Hola, quería hacer una consulta.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-full bg-navy py-3.5 text-center text-sm font-semibold text-cream transition-transform hover:scale-[1.02]"
                >
                  Escribir por WhatsApp
                </a>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid w-14 place-items-center rounded-full border border-navy/15 text-navy transition-colors hover:border-gold hover:text-gold"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full min-h-[360px] overflow-hidden rounded-card border border-navy/10 shadow-soft">
              <iframe
                src={OFFICE_MAP}
                title="Ubicación del estudio"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, minHeight: 360, display: 'block' }}
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
