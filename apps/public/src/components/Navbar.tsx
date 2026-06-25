'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/#capua', label: 'Capua' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/vendidas', label: 'Vendidas' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Bloquear scroll del body cuando el overlay está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Pill flotante ── */}
      <header className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
        <nav
          className={`pointer-events-auto flex items-center gap-2 rounded-full border border-gold/20 px-4 py-2.5 shadow-lift backdrop-blur-md transition-all duration-500 lg:gap-3 lg:px-5 ${
            scrolled ? 'bg-navy/92' : 'bg-navy/70'
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mr-1 flex shrink-0 items-center lg:mr-2"
          >
            <Image
              src="/img/logo.png"
              alt="NZ Estudio"
              width={38}
              height={38}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Links desktop */}
          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3 py-1.5 text-sm font-medium tracking-wide text-cream/75 transition-all duration-200 hover:bg-white/10 hover:text-cream"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Separador + CTA — solo desktop */}
          <span className="hidden h-4 w-px bg-gold/25 lg:block" />
          <Link
            href="/#contacto"
            className="hidden rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-navy transition-opacity hover:opacity-90 lg:block"
          >
            Contactar
          </Link>

          {/* Botón MENU — solo mobile */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className="ml-1 text-xs font-semibold uppercase tracking-[0.2em] text-cream/70 transition-colors hover:text-cream lg:hidden"
          >
            Menu
          </button>
        </nav>
      </header>

      {/* ── Overlay mobile fullscreen ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] flex flex-col bg-navy px-7 pb-10 pt-7"
          >
            {/* Header del overlay */}
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)}>
                <Image
                  src="/img/logo.png"
                  alt="NZ Estudio"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50 transition-colors hover:text-cream"
              >
                Cerrar
              </button>
            </div>

            {/* Links grandes */}
            <ul className="mt-14 flex flex-col gap-1">
              {[...links, { href: '/#contacto', label: 'Contacto' }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.06 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-cream/8 py-4 font-display text-4xl text-cream transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* CTA + marca al fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-auto"
            >
              <Link
                href="/#contacto"
                onClick={() => setOpen(false)}
                className="inline-block rounded-full bg-gold px-8 py-3 font-semibold text-navy"
              >
                Contactar ahora
              </Link>
              <p className="mt-6 text-xs text-cream/20">
                NZ Estudio Juridico Inmobiliario &mdash; {new Date().getFullYear()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
