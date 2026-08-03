import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { PageHeader } from '@/components/PageHeader';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Cómo el Estudio Jurídico-Inmobiliario Nadina Zaranich recolecta, usa y protege tus datos personales.',
  alternates: { canonical: '/politica-de-privacidad' },
};

const updated = '3 de agosto de 2026';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Legal"
          title="Política de privacidad"
          subtitle={`Última actualización: ${updated}`}
        />
        <section className="bg-cream pb-24 pt-14">
          <div className="mx-auto max-w-3xl space-y-8 px-5 text-ink lg:px-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-navy [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-muted [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ul]:text-muted [&_a]:text-navy [&_a]:underline">
            <div>
              <h2>1. Responsable del tratamiento</h2>
              <p>
                {site.name}, con domicilio en {site.address.street}, {site.address.city},{' '}
                {site.address.region}, Argentina. Contacto:{' '}
                <a href={`mailto:${site.email}`}>{site.email}</a> — Tel/WhatsApp:{' '}
                {site.phone.display}.
              </p>
            </div>

            <div>
              <h2>2. Qué datos recolectamos</h2>
              <p>
                Recolectamos únicamente los datos necesarios para prestar nuestros servicios
                inmobiliarios y de asesoramiento:
              </p>
              <ul>
                <li>Nombre y apellido.</li>
                <li>Número de teléfono (para comunicaciones por WhatsApp).</li>
                <li>Correo electrónico, cuando lo proporcionás voluntariamente.</li>
                <li>
                  Datos vinculados a la relación contractual (propiedad, contrato, recibos), cuando
                  sos cliente, propietario o inquilino.
                </li>
              </ul>
            </div>

            <div>
              <h2>3. Para qué usamos tus datos</h2>
              <ul>
                <li>Responder consultas sobre propiedades en venta o alquiler.</li>
                <li>
                  Enviarte, por WhatsApp, comprobantes (recibos, rendiciones) y recordatorios
                  relacionados con tu contrato.
                </li>
                <li>Cumplir obligaciones legales, contables e impositivas.</li>
              </ul>
              <p>
                No usamos tus datos para publicidad de terceros ni los vendemos, cedemos o
                comercializamos.
              </p>
            </div>

            <div>
              <h2>4. WhatsApp y Meta</h2>
              <p>
                Utilizamos la plataforma WhatsApp Business (Meta Platforms Ireland Ltd.) para
                enviarte comunicaciones. Al comunicarte con nosotros por WhatsApp, tus mensajes se
                procesan según la{' '}
                <a
                  href="https://www.whatsapp.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de privacidad de WhatsApp
                </a>
                . Sólo enviamos mensajes a personas que tienen una relación previa con el estudio.
              </p>
            </div>

            <div>
              <h2>5. Conservación</h2>
              <p>
                Conservamos los datos mientras dure la relación comercial y durante los plazos que
                exija la legislación aplicable. Luego se eliminan o anonimizan.
              </p>
            </div>

            <div>
              <h2>6. Tus derechos</h2>
              <p>
                Podés solicitar el acceso, rectificación, actualización o supresión de tus datos
                personales escribiéndonos a{' '}
                <a href={`mailto:${site.email}`}>{site.email}</a>. En Argentina, la Agencia de
                Acceso a la Información Pública es el órgano de control de la Ley 25.326 de
                Protección de Datos Personales.
              </p>
            </div>

            <div>
              <h2>7. Cambios en esta política</h2>
              <p>
                Podemos actualizar esta política. Publicaremos la versión vigente en esta misma
                página con su fecha de actualización.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
