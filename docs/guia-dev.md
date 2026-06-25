# Guía rápida del sistema — para Giuliano

> Para que cualquiera que entre al proyecto entienda de qué va cada parte sin leer 50 archivos.

---

## 1. Qué hay corriendo (los contenedores Docker)

Cuando hacés `docker compose up -d`, levantás 8 "computadoras virtuales" que se hablan entre sí:

```
Tu browser
    │
    ├── :8080  →  nginx        (portero / enrutador)
    │               ├── /api/* →  php-fpm  (Laravel — la API)
    │               └── resto  →  node-dev (React — panel admin)
    │
    ├── :3000  →  next-public  (Next.js — sitio público de venta)
    ├── :8081  →  phpmyadmin   (gestor visual de la DB)
    └── :8082  →  legacy       (el PHP viejo, sigue andando)

Internos (sin puerto público):
    mariadb     Base de datos
    gotenberg   Motor de PDFs (Chromium headless)
```

### Para qué sirve cada uno

| Container | Qué hace | Lo usa |
|---|---|---|
| **nginx** | Portero. Recibe todo en :8080 y decide a quién mandarlo. | Nadie lo toca directo |
| **php-fpm** | Laravel. Toda la lógica: contratos, recibos, WhatsApp, auth. | El admin React lo llama por `/api/v1/...` |
| **node-dev** | React + Vite. El panel admin (gestión de alquileres). | La dueña / admin |
| **next-public** | Next.js. El sitio público de venta (Capua, catálogo). | Cualquier visitante en :3000 |
| **mariadb** | Base de datos MariaDB. Guarda todo. | Laravel |
| **gotenberg** | Convierte HTML → PDF con Chromium. | Laravel cuando generás un recibo |
| **phpmyadmin** | Ver/editar la DB con interfaz web. Solo en dev. | Vos en dev |
| **legacy** | El PHP procedural viejo en :8082. Sigue funcionando. | Mientras se termina el nuevo |

### Comandos que más vas a usar

```bash
docker compose up -d          # Levantar todo
docker compose down           # Parar todo (los datos quedan)
docker compose down -v        # Parar + borrar DB (se re-importa sola)
docker compose ps             # Ver qué está corriendo
docker compose logs -f        # Ver logs en vivo (Ctrl+C para salir)

# Correr comandos dentro de un container:
docker compose exec php-fpm php artisan migrate      # Migraciones Laravel
docker compose exec php-fpm ./vendor/bin/pest        # Tests PHP
docker compose exec node-dev pnpm test               # Tests React admin
docker compose exec next-public pnpm test            # Tests sitio público
```

---

## 2. Dónde está cada cosa en el código

```
Inmobiliaria-NZ/
├── apps/
│   ├── api/          ← Laravel (PHP). Toda la API REST.
│   │   ├── app/Http/Controllers/   ← Controladores (lógica de cada endpoint)
│   │   ├── app/Models/             ← Modelos (Owner, Tenant, Contract, etc.)
│   │   └── routes/api.php          ← Qué URL llama a qué controlador
│   │
│   ├── web/          ← React + Vite (panel admin).
│   │   └── src/
│   │       ├── features/           ← Una carpeta por módulo (recibos, contratos…)
│   │       ├── components/         ← Componentes reutilizables (botones, tablas…)
│   │       └── App.tsx             ← Punto de entrada, define las rutas
│   │
│   └── public/       ← Next.js (sitio público de venta).
│       └── src/
│           ├── app/                ← Páginas (page.tsx = home, /propiedades, etc.)
│           └── components/
│               ├── home/           ← Secciones del home (Hero, Capua, About…)
│               └── (otros)        ← Componentes compartidos (Navbar, Footer…)
│
├── docker/           ← Configuración de cada container (Dockerfiles)
├── docs/             ← Roadmap, decisiones, esta guía
└── legacy/           ← El PHP viejo (no tocar salvo emergencia)
```

---

## 3. Cómo funcionan los estilos (Tailwind)

El sitio público (`apps/public`) y el admin (`apps/web`) usan **Tailwind CSS**.

### Tailwind = clases CSS ya hechas

En vez de escribir CSS separado, ponés clases directamente en el HTML/JSX:

```tsx
// En lugar de esto (CSS normal):
// .titulo { font-size: 2rem; color: #05172d; margin-top: 1rem; }

// Hacés esto (Tailwind):
<h2 className="text-4xl text-navy mt-4">Título</h2>
```

### Las clases más comunes

| Clase | Qué hace |
|---|---|
| `text-xl` / `text-4xl` | Tamaño de fuente (xl, 2xl, 3xl, 4xl…) |
| `font-bold` / `font-semibold` | Grosor de fuente |
| `text-navy` / `text-gold` | Color de texto (colores del proyecto) |
| `bg-navy` / `bg-cream` | Color de fondo |
| `mt-4` / `mb-8` / `py-16` | Márgenes y paddings (números: 1=4px, 4=16px, 8=32px…) |
| `flex` / `grid` | Display flex / grid |
| `gap-4` | Espacio entre hijos en flex/grid |
| `grid-cols-2` / `lg:grid-cols-2` | 2 columnas (la `lg:` solo aplica en pantallas grandes) |
| `rounded-card` | Bordes redondeados (token del proyecto) |
| `shadow-lift` | Sombra del proyecto |
| `w-full` / `max-w-7xl` | Ancho completo / ancho máximo |
| `hidden lg:block` | Oculto en mobile, visible en desktop |

### Responsive: prefijos de pantalla

```
sin prefijo = mobile (todo)
sm:  = tablet chica (≥640px)
md:  = tablet (≥768px)
lg:  = desktop (≥1024px)
xl:  = desktop grande (≥1280px)
```

Ejemplo: `text-2xl lg:text-4xl` → 2xl en mobile, 4xl en desktop.

### Colores y tokens del proyecto

Definidos en `apps/public/src/app/globals.css`:

```css
--color-navy:  #05172d   →  bg-navy / text-navy / border-navy
--color-gold:  #c5a572   →  bg-gold / text-gold
--color-cream: #f7f4ee   →  bg-cream / text-cream
--color-ink:   #1a2231   →  text-ink  (texto principal oscuro)
--color-muted: #5b6675   →  text-muted (texto secundario gris)

--radius-card: 1rem      →  rounded-card
--shadow-lift: …         →  shadow-lift
--shadow-soft: …         →  shadow-soft
```

### ¿Dónde busco qué clase usar?

- **Tailwind docs**: tailwindcss.com/docs — buscás la propiedad CSS y encontrás la clase
- **Cheatsheet rápida**: nerdcave.com/tailwind-cheat-sheet

---

## 4. Cómo está organizado el home del sitio público

Archivo: `apps/public/src/app/page.tsx`

```
Home (page.tsx)
├── <Navbar />          barra de navegación
├── <Hero />            sección inicial "Encontrá la propiedad…"
├── <Capua />           toda la sección de Capua de Edilizia
│   ├── carrusel de slides
│   ├── <CapuaCrossfade /> banner crossfade de 3 imágenes
│   ├── amenities (Piscina, Cocheras, etc.)
│   ├── galería interior
│   └── ubicación en Funes (imagen + Google Maps)
├── <About />           sección "Nadina Zaranich / Conocé nuestra historia"
├── <Categories />      "Explorá por categoría"
├── <PropertiesMap />   mapa de propiedades
├── <Contact />         "Visitanos o escribinos"
└── <Footer />
```

Para editar una sección, abrís el archivo del componente en `apps/public/src/components/home/`.

---

## 5. Agregar o cambiar texto/estilos (workflow básico)

1. El container `next-public` ya corre en modo dev con **hot reload** — cada vez que guardás un archivo, el browser se actualiza solo.
2. Abrís el archivo del componente que querés cambiar.
3. Modificás el texto o las clases Tailwind.
4. Guardás → el browser refresca solo.
5. Si agregás un componente nuevo, lo importás en el archivo padre y lo ponés en el JSX.

---

## 6. La diferencia entre React (admin) y Next.js (sitio público)

| | React + Vite (admin) | Next.js (sitio público) |
|---|---|---|
| **Dónde** | `apps/web/` | `apps/public/` |
| **Puerto** | :8080 (via nginx) | :3000 |
| **Para qué** | Panel de gestión interno | Sitio que ven los clientes |
| **SEO** | No importa (requiere login) | Crítico — Next genera HTML en build |
| **Datos** | Fetch en el browser | Fetch en build time (SSG) |

### ¿Qué es SSG?

Next.js en modo SSG (Static Site Generation) genera el HTML **cuando hacés el build**, no cuando el visitante abre la página. Resultado: el sitio es rapidísimo y Google puede leerlo bien (SEO). Las propiedades se actualizan cuando se hace un nuevo build.

---

## 7. Flujo de datos

```
Browser (visitante)
    │ HTTP GET /propiedades
    ▼
Next.js (build time)
    │ fetchAllSaleProperties()
    ▼
Laravel API  GET /api/v1/sale-properties
    │ Eloquent query
    ▼
MariaDB  →  devuelve propiedades  →  Laravel  →  Next.js  →  HTML al browser
```

---

## 8. Framer Motion (animaciones)

Usado en el sitio público para animaciones de entrada y transiciones.

```tsx
import { motion } from 'framer-motion';

// <motion.div> = <div> normal + animaciones
<motion.div
  initial={{ opacity: 0, y: 20 }}   // estado inicial
  animate={{ opacity: 1, y: 0 }}    // estado final
  transition={{ duration: 0.5 }}    // cuánto tarda
>
  contenido
</motion.div>
```

El componente `<Reveal>` que se usa en todo el sitio es un wrapper que aplica esta animación de entrada cuando el elemento entra en el viewport (scroll reveal).
