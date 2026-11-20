import type { RefObject } from 'react'
import type { SortMode } from '../data/catalog'

export type FormatFilter = 'Todos' | 'Películas' | 'Series' | 'Animes'
export type StatusFilter = 'Todos' | 'Por ver' | 'Visto'

interface Props {
  format: FormatFilter
  onFormat: (value: FormatFilter) => void
  status: StatusFilter
  onStatus: (value: StatusFilter) => void
  query: string
  onQuery: (value: string) => void
  favoritesOnly: boolean
  onFavoritesOnly: (value: boolean) => void
  sort: SortMode
  onSort: (value: SortMode) => void
  searchRef: RefObject<HTMLInputElement | null>
  count: number
  total: number
  onBeforeChange: () => void
}

const formats: FormatFilter[] = ['Todos', 'Películas', 'Series', 'Animes']
const statuses: StatusFilter[] = ['Todos', 'Por ver', 'Visto']
const sorts: Array<{ value: SortMode; label: string }> = [
  { value: 'archivo', label: 'Archivo' },
  { value: 'anio', label: 'Año' },
  { value: 'titulo', label: 'A–Z' },
  { value: 'estado', label: 'Estado' },
  { value: 'favoritos', label: 'Favoritos' },
]

export function FilterDock({
  format,
  onFormat,
  status,
  onStatus,
  query,
  onQuery,
  favoritesOnly,
  onFavoritesOnly,
  sort,
  onSort,
  searchRef,
  count,
  total,
  onBeforeChange,
}: Props) {
  const change = <T,>(setter: (value: T) => void, value: T) => {
    onBeforeChange()
    setter(value)
  }

  return (
    <div className="sticky top-16 z-40 -mx-5 mb-8 border-y border-white/10 bg-ink/85 px-5 py-3 backdrop-blur-xl md:-mx-10 md:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {formats.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => change(onFormat, option)}
              aria-pressed={format === option}
              className={`border px-3 py-2 mono transition-colors ${
                format === option
                  ? 'border-neon bg-neon text-ink'
                  : 'border-white/15 text-muted hover:border-neon/60 hover:text-bone'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="hidden h-6 w-px bg-white/15 lg:block" />

        <div className="flex gap-1.5">
          {statuses.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => change(onStatus, option)}
              aria-pressed={status === option}
              className={`border px-3 py-2 mono transition-colors ${
                status === option
                  ? 'border-bone/60 bg-bone/10 text-bone'
                  : 'border-transparent text-muted hover:text-bone'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 mono text-muted">
          ORDEN
          <select
            value={sort}
            onChange={(event) => change(onSort, event.target.value as SortMode)}
            aria-label="Ordenar títulos"
            className="border border-white/15 bg-ink px-2 py-2 mono text-bone focus:border-neon focus:outline-none"
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="ml-auto flex flex-1 items-center gap-3 sm:flex-none">
          <label className="flex min-w-0 flex-1 items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 focus-within:border-neon sm:w-64">
            <span className="mono text-neon" aria-hidden="true">⌕</span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => change(onQuery, event.target.value)}
              placeholder="BUSCAR EN EL ARCHIVO…"
              aria-label="Buscar títulos"
              className="w-full bg-transparent mono text-bone placeholder:text-muted/70 focus:outline-none"
            />
          </label>
          <span className="hidden mono text-muted/70 xl:inline" aria-hidden="true">/ BUSCAR</span>

          <button
            type="button"
            onClick={() => change(onFavoritesOnly, !favoritesOnly)}
            aria-pressed={favoritesOnly}
            aria-label="Mostrar solo favoritos"
            className={`border px-3 py-2 text-lg leading-none transition-colors ${
              favoritesOnly
                ? 'border-neon bg-neon/15 text-neon'
                : 'border-white/15 text-muted hover:text-neon'
            }`}
          >
            ♥
          </button>

          <span className="mono whitespace-nowrap text-muted">
            <b className="text-neon">{String(count).padStart(2, '0')}</b> / {total}
          </span>
        </div>
      </div>
    </div>
  )
}
