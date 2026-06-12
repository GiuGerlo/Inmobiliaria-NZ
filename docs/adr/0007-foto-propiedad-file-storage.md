# 0007 — Foto de propiedad: archivo WebP en disco, no LONGBLOB

- **Estado**: aceptada
- **Fecha**: 2026-06-10
- **Contexto**: el schema legacy tiene `propiedad.Foto_Propiedad` LONGBLOB (+ `Foto_Propiedad_GXI` varchar). Auditoría del legacy: **ninguna página lee ni escribe esas columnas** (una sola referencia comentada en `propiedades.php`) — columnas muertas. Sub-D necesita definir cómo maneja la foto el sistema nuevo.
- **Opciones consideradas**:
  - **A. Archivo en disco + path en DB**: foto convertida a WebP en `storage/app/public/propiedades/{id}/foto.webp`, columna nueva `foto_path`. Pro: DB liviana, backups chicos, servida estática por nginx, formato moderno. Contra: deploy debe persistir `storage/`.
  - **B. Seguir con LONGBLOB**: paridad literal con el schema. Contra: nadie la usa, infla dumps, serving via PHP.
- **Decisión**: **A** (pedido del usuario). Una foto por propiedad; subir otra reemplaza. Conversión a WebP (calidad 82) con Intervention Image v3 sobre GD (`--with-webp` agregado a la imagen php-fpm). Validación de upload por contenido real (finfo), máx 5 MB. nginx sirve `/storage/` con `alias` directo al disk public (sin symlink `storage:link` — evita problemas de symlinks en bind mounts de Windows).
- **Consecuencias**: las columnas LONGBLOB quedan intactas y muertas hasta deprecar el legacy (se borran en esa fase). El deploy (sub-H) debe contemplar persistencia de `storage/app/public`. Galería multi-foto = candidato sub-G (tabla nueva).
