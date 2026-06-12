# Skills de diseño frontend (instaladas 2026-06-10)

Skills agregadas para apoyar **sub-E (Frontend React core)** y el diseño visual de la SPA de Inmobiliaria NZ. Se invocan con la herramienta Skill (o `/<nombre>` en el chat). Instaladas vía `npx skills add` / `npx impeccable`.

> **Ubicación**: `.agents/skills/<skill>/` y `.claude/skills/<skill>/` (el agente las lee desde acá). Manifiesto en `skills-lock.json`.
> **Origen**: `kylezantos/design-motion-principles`, `impeccable`, `Leonxlnx/taste-skill` (13 skills).
> ⚠️ Las skills corren con permisos completos del agente — revisar antes de usar en algo sensible.

## Cuál usar según la tarea

### Diseño / "taste" general de la SPA
| Skill | Cuándo usarla |
|---|---|
| **design-taste-frontend** | Default anti-genérico para páginas, paneles y redesigns. Lee el brief, infiere la dirección de diseño y arma interfaces que no parecen template. **La principal para sub-E.** |
| **design-taste-frontend-v1** | Versión vieja (v1) — solo si necesitás compatibilidad exacta con su comportamiento. Por defecto usar la v2 de arriba. |
| **impeccable** | Audit/polish integral de UI: jerarquía visual, accesibilidad, espaciado, tipografía, color, motion, estados de error, design tokens. Para "esto está soso, mejoralo" o revisar una pantalla ya hecha. Corré `/impeccable init` una vez para fijar el contexto de diseño. |
| **high-end-visual-design** | Cuando querés que algo se sienta "caro"/de agencia: fuentes, sombras, cards y animaciones premium; bloquea los defaults que abaratan. |
| **redesign-existing-projects** | Subir de nivel UI existente sin romper funcionalidad (audita y reemplaza patrones AI genéricos). Útil si rehacemos pantallas del legacy. |

### Estéticas concretas (elegir una identidad)
| Skill | Estética |
|---|---|
| **minimalist-ui** | Editorial limpio, monocromo cálido, bento flat, pasteles apagados. Sin gradientes ni sombras pesadas. |
| **industrial-brutalist-ui** | Brutalismo industrial: grillas rígidas, contraste tipográfico extremo, terminal/blueprint. Para dashboards densos de datos. |

### Motion / animación
| Skill | Cuándo |
|---|---|
| **design-motion-principles** | Transiciones, hovers, micro-interacciones, enter/exit. Dos modos: construir motion con propósito, o auditar animaciones existentes (emite reporte HTML). Basado en Emil Kowalski / Jakub Krehel / Jhey Tompkins. |
| **gpt-taste** | Motion engineer GSAP avanzado: ScrollTriggers (pinning, scrubbing), bento gaplesss, tipografía editorial ancha, estructura AIDA. Más pesado/opinado. |

### Generación de imágenes de referencia (no escriben código)
| Skill | Salida |
|---|---|
| **imagegen-frontend-web** | Una imagen horizontal por sección de un sitio (referencias de diseño para después codear). |
| **imagegen-frontend-mobile** | Conceptos de pantallas de app mobile en mockup de teléfono. |
| **image-to-code** | Genera la imagen de diseño primero, la analiza, y después implementa el sitio para que coincida. |
| **brandkit** | Boards de marca, sistemas de logo, identidad visual premium. |

### Sistemas de diseño / utilidades
| Skill | Para qué |
|---|---|
| **stitch-design-taste** | Genera `DESIGN.md` semántico (sistema de diseño) para Google Stitch — tipografía/color/layout anti-genéricos. |
| **full-output-enforcement** | Anti-truncado: fuerza generación de código completa, prohíbe placeholders, maneja cortes por límite de tokens. Útil en archivos largos. |

## Recomendación para sub-E (frontend NZ)

La SPA es una app de gestión interna (tablas, formularios, modales) — no un landing de marketing. Por eso:

- **Base**: `design-taste-frontend` + `impeccable` (para audit) → look limpio y profesional sin caer en lo genérico.
- **Estética sugerida**: `minimalist-ui` encaja con una herramienta de administración (legible, sobrio). `industrial-brutalist-ui` solo si buscamos algo más crudo para dashboards de datos.
- **Motion**: `design-motion-principles` para micro-interacciones sutiles (no GSAP pesado).
- El stack del proyecto ya fija **shadcn/ui + Tailwind** (ver `.claude/rules/stack.md`); estas skills complementan, no reemplazan, esa decisión.

La identidad visual definitiva ("Identidad NZ") se decide en el brainstorming de sub-E.
