# Product

## Register

product

## Users

Administradores de la inmobiliaria NZ (negocio familiar). Gestionan el día a día de alquileres: ciudades, dueños, inquilinos, propiedades, contratos, recibos y rendiciones mensuales. Uso interno, recurrente, principalmente en escritorio. Pasan tiempo real dentro del sistema cargando datos y emitiendo comprobantes — no es una visita ocasional, es su herramienta de trabajo.

## Product Purpose

Reemplazar el sistema PHP legacy de administración de alquileres por una app moderna (Laravel API + React SPA) sin perder funcionalidad y sumando mejoras. Éxito = la inmobiliaria hace todo lo que hacía antes (ABMs, recibos, rendiciones a dueños) más rápido, con menos errores y con una interfaz que no se siente vieja. El sistema viejo y el nuevo conviven durante la transición.

## Brand Personality

Sobria y profesional. Voz clara y directa, en español rioplatense, sin jerga. Transmite confianza y orden — una herramienta seria que respeta el tiempo de quien la usa. Personalidad en 3 palabras: **clara, confiable, calma**. Lo opuesto a abrumar: el usuario debe sentir que el sistema lo ayuda, no que tiene que pelearlo.

## Anti-references

- **El sistema legacy actual**: Bootstrap genérico + DataTables recargado, tablas apretadas, todo gris-azulado de plantilla. Es exactamente lo que estamos dejando atrás.
- **UIs recargadas/coloridas**: saturación de colores, sombras pesadas, gradientes decorativos. Nada de eso.
- **Estética de landing / SaaS marketing**: nada de heros gigantes, secciones de "features", eyebrows en mayúsculas, métricas con números enormes. Es una herramienta de trabajo, no un sitio para vender.

## Design Principles

- **Claridad sobre decoración** — cada pantalla prioriza la tarea que el usuario vino a hacer; lo demás se calla.
- **Rápido para el uso diario** — los flujos se optimizan para quien repite la misma carga decenas de veces, no para el primer vistazo.
- **Densidad sin saturación** — muestra muchos datos (tablas, recibos) manteniendo calma visual y aire; legibilidad antes que meter más.
- **Moderno pero no moderno-por-moda** — se siente actual y prolijo sin perseguir tendencias que envejecen mal; estabilidad sobre espectáculo.
- **Accesible de verdad** — WCAG AA no es un extra, es parte de "terminado".

## Accessibility & Inclusion

WCAG 2.1 AA. Contraste de texto ≥4.5:1 (≥3:1 para texto grande), navegación completa por teclado con foco visible, labels asociados a cada control de formulario, mensajes de error claros y asociados a su campo, y alternativa para `prefers-reduced-motion` en toda animación. Pensar en que la app puede ser usada por personas de distintas edades en la inmobiliaria: targets de click cómodos y tipografía que no obligue a forzar la vista.
