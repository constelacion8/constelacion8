# Constelación 8

Repositorio principal de **Constelación 8**, directorio y mapa interactivo de personas relevantes vinculadas a Canarias.

## Estado del repositorio

- Rama principal de producción: `main`.
- Despliegue automático mediante GitHub Pages al publicar cambios en `main`.
- Interfaz web actual: `index.html`, `app.css`, `app.js` y `map-data.js`.
- La base de datos editorial se gestiona en Supabase; GitHub contiene el código y los recursos versionados de la web.

## Flujo de trabajo

1. Mantener `main` siempre publicable.
2. Versionar en GitHub cualquier cambio de código, estilos, recursos o configuración.
3. No guardar claves, contraseñas ni secretos de Supabase en el repositorio.
4. Usar ramas y pull requests para cambios estructurales; las correcciones pequeñas y controladas pueden integrarse directamente cuando sea apropiado.
5. Cada actualización de `main` activa el flujo de despliegue de GitHub Pages definido en `.github/workflows/pages.yml`.

## Fuente de verdad

- **Datos y relaciones editoriales:** Supabase.
- **Código, interfaz y despliegue:** GitHub.

Esto permite ampliar la base de datos de forma independiente sin perder trazabilidad del código ni del historial de publicación.
