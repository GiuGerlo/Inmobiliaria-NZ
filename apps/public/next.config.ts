import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Hostinger Premium no corre Node → exportamos estático (SSG puro).
  output: 'export',
  // El export no optimiza imágenes en runtime; las servimos tal cual del backend.
  images: { unoptimized: true },
  // URLs con barra final → hosting estático las sirve como carpeta/index.html.
  trailingSlash: true,
};

export default nextConfig;
