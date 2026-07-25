# Constelación 8

Repositorio principal de **Constelación 8**, directorio y mapa interactivo de personas relevantes vinculadas a Canarias.

## Estado del repositorio

- Rama principal de producción: `main`.
- La web está preparada para publicarse con GitHub Pages directamente desde `main` y la raíz `/` del repositorio.
- Interfaz web actual: `index.html`, `app.css`, `app.js` y `map-data.js`.
- La base de datos editorial se gestiona en Supabase; GitHub contiene el código y los recursos versionados de la web.
- El archivo `.nojekyll` evita que GitHub Pages intente procesar esta web estática con Jekyll.

## Publicación

En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → /(root) → Save**.

Una vez activado ese ajuste del repositorio, los cambios publicados en `main` se sirven desde GitHub Pages.

## Flujo de trabajo

1. Mantener `main` siempre publicable.
2. Versionar en GitHub cualquier cambio de código, estilos, recursos o configuración.
3. No guardar claves, contraseñas ni secretos de Supabase en el repositorio.
4. Usar ramas y pull requests para cambios estructurales; las correcciones pequeñas y controladas pueden integrarse directamente cuando sea apropiado.

## Fuente de verdad

- **Datos y relaciones editoriales:** Supabase.
- **Código, interfaz y publicación:** GitHub.
