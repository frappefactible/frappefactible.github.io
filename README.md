# FACTIBLE — Cartelera Nocturna

Mi lista personal de películas, series y animes por ver. Versión 100% estática:
**React + Vite + TypeScript + Tailwind CSS**, desplegada en GitHub Pages sin base de datos.

## estructura

- `src/data/catalog.ts` — los 93 títulos migrados del vanilla, con tipos y reseñas.
  Las antiguas "fases" se sustituyeron por 8 colecciones temáticas.
- `src/components/` — preloader, hero/ruleta, dock de filtros, grid, ticket modal, stats y stickers.
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
