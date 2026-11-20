# FACTIBLE — Crea tu Cartelera

Mi lista personal de películas, series y animes por ver. Versión 100% estática:
**React + Vite + TypeScript + Tailwind CSS**, desplegada en GitHub Pages sin base de datos.

## estructura

- `src/data/catalog.ts` — los 97 títulos (93 migrados del vanilla + 4 animes nuevos), con tipos y reseñas.
- `src/components/` — preloader, hero/ruleta, dock de filtros, grid/lista, ticket modal, planner, stats y stickers.
- `public/logos`, `public/GIFs` — assets originales, servidos tal cual.
- `legacy/` — el `script.js` y `style.css` originales, conservados como referencia.
- `.github/workflows/deploy.yml` — build y deploy automáticos en cada push a `main`.

## comandos

```bash
npm install
npm run dev      # servidor local
npm run build    # tsc --noEmit + vite build
npm run preview  # vista previa del build
```

Favoritos, estado ("por ver" / "visto") y reseñas se guardan en `localStorage`.
Las carátulas se cargan desde TMDB/Wikimedia, igual que en la versión original.
