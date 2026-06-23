# Sitio público Next.js (apps/public) — SSG

Reglas del sitio público de venta (`apps/public`, Fusión NZ Fase 5). Es **estático** (`output: 'export'`)
porque prod = Hostinger sin Node. Consume la **API pública de ventas** de Laravel.

## Principios

- **Todo es SSG.** Nada de server actions, route handlers dinámicos, ni datos en runtime del servidor.
  Los datos se traen **en build** (server components / `generateStaticParams`) y quedan embebidos.
- **Cero fetch desde el browser** a la API de ventas → sin CORS. Si un componente cliente (mapa, filtros,
  galería) necesita datos, se le pasan como **props** desde el server component que los trajo en build.
- **Una sola fuente de catálogo**: `GET /api/v1/sale-properties` ya devuelve el objeto completo (imágenes,
  tipo, `slug`, `map_embed`, lat/lng). Traer todo el catálogo una vez y derivar listado/detalle/vendidas/mapa.

## Entorno

- `API_INTERNAL_URL` (`http://nginx/api/v1`) — fetch server-side en build/dev dentro de Docker.
- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL` — URLs públicas (browser). En prod = dominios reales.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Maps JS. Vacío ⇒ el mapa no se renderiza (no rompe el build).
- Las URLs de imagen vienen **absolutas** del backend (`APP_URL/storage/...`); usar tal cual.

## Imágenes

- `next/image` con `images.unoptimized: true` (requisito de export) o `<img>` directo. Sin loader remoto.
- Portada de una propiedad = primera imagen por `sort_order` (las trae el backend ya ordenadas).

## SEO

- `generateMetadata` por página y por propiedad (title, description, canonical, OG/Twitter).
- `og:image` por propiedad = su primera imagen; fallback `/img/opengraph.jpg`.
- JSON-LD: `RealEstateAgent` global (en el layout) + por propiedad en su detalle.
- `app/sitemap.ts` + `app/robots.ts` generados en build (todas las propiedades).

## Seguridad

- **`map_embed` es contenido del admin → NUNCA** `dangerouslySetInnerHTML` con su HTML crudo.
  Pasar siempre por `lib/sanitizeMapEmbed` (allowlist host/path de Google Maps + iframe reconstruido).
- El único `dangerouslySetInnerHTML` permitido es para JSON-LD (string serializado por nosotros).

## Comandos (siempre dentro del container)

```
docker compose exec next-public pnpm dev      # ya corre solo al levantar el stack
docker compose exec next-public pnpm test     # vitest
docker compose exec next-public pnpm lint
docker compose exec next-public pnpm build     # genera out/ (export estático)
```

Navegar en local: `http://localhost:3000` (puerto directo, NO por nginx — en prod es otro dominio).
