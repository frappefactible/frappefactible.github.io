# Guía del Proyecto: frappefactible.github.io

## Naturaleza del Sitio
- Aplicación **100% estática** construida con **React + Vite + TypeScript + Tailwind CSS**, desplegada en **GitHub Pages** (`base: '/'` en `vite.config.ts` porque es un repo `<usuario>.github.io`).
- **Sin base de datos ni backend:** Todo el catálogo (películas, series, animes) vive en archivos locales tipados en `src/data/`. Cualquier estado interactivo del visitante (favoritos, "por ver") se guarda en `localStorage`.
- **Preservación:** Migrar todos los títulos existentes en `index.html` / `script.js` y mover `logos/` y `GIFs/` a `public/` sin perder ningún asset.

## Uso de Herramientas y Skills
- Antes de escribir código con `gsap`, `@gsap/react`, `animejs`, `lenis` o `tailwindcss`, usa **Context7 MCP** para consultar su sintaxis vigente.
- Carga las skills disponibles (`frontend-design`, `gsap-react`, `animejs-v4`, `web-design-guidelines`) según la tarea.
- Al terminar cambios visuales o funcionales, levanta el servidor local y verifica en **Playwright MCP** en desktop (`1440x900`) y mobile (`390x844`) que no existan errores de consola, desbordamientos o imágenes/GIFs rotos.

## Reglas Técnicas de Animación
- **GSAP:** Usar siempre `useGSAP()` de `@gsap/react` con `{ scope }` y `contextSafe`. Usar `Flip` para transiciones de filtrado, `ScrollTrigger` para scroll y `SplitText` para tipografía. Respetar `prefers-reduced-motion` con `gsap.matchMedia()`.
- **Anime.js v4:** Usar exclusivamente la API v4 (`createScope`, `animate`, `stagger`, `spring`, `createDraggable`) con limpieza `scope.current?.revert()`.