import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Flip } from './lib/gsap'
import { catalog, getDisplayTitle, getYear } from './data/catalog'
import type { ItemOverride, MediaItem, MediaStatus, PlannerEntry, SortMode } from './data/catalog'
import { usePersistentState } from './hooks/usePersistentState'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useLenis } from './hooks/useLenis'
import { Preloader } from './components/Preloader'
import { SiteHeader } from './components/SiteHeader'
import { Hero } from './components/Hero'
import { FilterDock } from './components/FilterDock'
import type { FormatFilter, StatusFilter, ViewMode } from './components/FilterDock'
import { MediaGrid } from './components/MediaGrid'
import { MediaListView } from './components/MediaListView'
import { TicketModal } from './components/TicketModal'
import { StatsSection } from './components/StatsSection'
import { Planner } from './components/Planner'
import { Stickers } from './components/Stickers'
import { DataBackup } from './components/DataBackup'
import type { BackupData } from './components/DataBackup'

type Overrides = Record<number, ItemOverride>
type LocalData = Omit<BackupData, 'version' | 'exportedAt'>
const URL_FORMATS: FormatFilter[] = ['Todos', 'Películas', 'Series', 'Animes']
const URL_STATUSES: StatusFilter[] = ['Todos', 'Por ver', 'Visto']
const URL_SORTS: SortMode[] = ['archivo', 'anio', 'titulo', 'estado', 'favoritos']

/** Lee filtros y ficha abierta desde la URL para poder compartirlos. */
const readUrl = () => {
  const result: {
    tipo?: FormatFilter
    estado?: StatusFilter
    buscar?: string
    favoritos?: boolean
    orden?: SortMode
    vista?: ViewMode
    ficha?: number
  } = {}
  if (typeof window === 'undefined') return result
  const params = new URLSearchParams(window.location.search)
  const tipo = params.get('tipo')
  const tipoMatch = URL_FORMATS.find((value) => value.toLowerCase() === tipo?.toLowerCase())
  if (tipoMatch) result.tipo = tipoMatch
  const estado = params.get('estado')?.toLowerCase().replace(/-/g, ' ') ?? ''
  const estadoMatch = URL_STATUSES.find((value) => value.toLowerCase() === estado)
  if (estadoMatch) result.estado = estadoMatch
  const buscar = params.get('buscar')
  if (buscar) result.buscar = buscar
  if (params.get('favoritos') === '1') result.favoritos = true
  const orden = params.get('orden')
  if (orden && URL_SORTS.includes(orden as SortMode)) result.orden = orden as SortMode
  const vista = params.get('vista')
  if (vista === 'grid' || vista === 'list') result.vista = vista
  const ficha = window.location.hash.match(/^#ficha-(\d+)$/)
  if (ficha) result.ficha = Number(ficha[1])
  return result
}

const ANIME_TYPES = ['Anime', 'Película Anime', 'OVA', 'Manga']
const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const revivePlanner = (raw: unknown): PlannerEntry[] =>
  Array.isArray(raw)
    ? raw
        .map((entry): PlannerEntry | null => {
          if (typeof entry === 'number') return { id: entry, note: '' }
          if (entry && typeof entry === 'object' && typeof (entry as PlannerEntry).id === 'number') {
            const value = entry as PlannerEntry
            return { id: value.id, note: String(value.note ?? '') }
          }
          return null
        })
        .filter((entry): entry is PlannerEntry => Boolean(entry))
    : []

const sortItems = (list: MediaItem[], mode: SortMode, favorites: number[]): MediaItem[] => {
  const sorted = [...list]
  switch (mode) {
    case 'anio':
      return sorted.sort((a, b) => Number(getYear(b)) - Number(getYear(a)) || a.id - b.id)
    case 'titulo':
      return sorted.sort((a, b) =>
        getDisplayTitle(a).localeCompare(getDisplayTitle(b), 'es', { sensitivity: 'base' }),
      )
    case 'estado':
      return sorted.sort(
        (a, b) => (a.status === 'Visto' ? 1 : 0) - (b.status === 'Visto' ? 1 : 0) || a.id - b.id,
      )
    case 'favoritos':
      return sorted.sort(
        (a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)) || a.id - b.id,
      )
    default:
      return sorted.sort((a, b) => a.id - b.id)
  }
}

export default function App() {
  const reduced = useReducedMotion()
  useLenis(!reduced)

  const initialUrl = useMemo(readUrl, [])
  const [booting, setBooting] = useState(true)
  const [format, setFormat] = useState<FormatFilter>(initialUrl.tipo ?? 'Todos')
  const [status, setStatus] = useState<StatusFilter>(initialUrl.estado ?? 'Todos')
  const [query, setQuery] = useState(initialUrl.buscar ?? '')
  const [favoritesOnly, setFavoritesOnly] = useState(initialUrl.favoritos ?? false)
  const [selectedId, setSelectedId] = useState<number | null>(initialUrl.ficha ?? null)
  const [view, setView] = useState<ViewMode>(initialUrl.vista ?? 'grid')
  const [showTop, setShowTop] = useState(false)

  const [favorites, setFavorites] = usePersistentState<number[]>('factible:favorites:v1', [])
  const [planner, setPlanner] = usePersistentState<PlannerEntry[]>(
    'factible:planner:v1',
    [],
    revivePlanner,
  )
  const [overrides, setOverrides] = usePersistentState<Overrides>('factible:overrides:v1', {})
  const [sort, setSort] = usePersistentState<SortMode>('factible:sort:v1', initialUrl.orden ?? 'archivo')
  const [history, setHistory] = usePersistentState<number[]>('factible:roulette-history:v1', [])

  useEffect(() => {
    if (initialUrl.orden) setSort(initialUrl.orden)
  }, [initialUrl.orden, setSort])

  const searchRef = useRef<HTMLInputElement>(null)
  const spinRef = useRef<(() => void) | null>(null)
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null)

  const items = useMemo(
    () => catalog.map((item) => ({ ...item, ...overrides[item.id] })),
    [overrides],
  )

  const captureFlip = useCallback(() => {
    if (!reduced) flipState.current = Flip.getState('.media-card')
  }, [reduced])

  const sortedCatalog = useMemo(
    () => sortItems(items, sort, favorites),
    [items, sort, favorites],
  )

  const visibleItems = useMemo(() => {
    const term = normalize(query.trim())
    const filtered = sortedCatalog.filter((item) => {
      if (format === 'Películas' && item.type !== 'Película') return false
      if (format === 'Series' && item.type !== 'Serie') return false
      if (format === 'Animes' && !ANIME_TYPES.includes(item.type)) return false
      if (status !== 'Todos' && item.status !== status) return false
      if (favoritesOnly && !favorites.includes(item.id)) return false
      if (term && !normalize(item.title).includes(term)) return false
      return true
    })
    return filtered
  }, [sortedCatalog, format, status, favoritesOnly, favorites, query])

  const visibleIds = useMemo(
    () => new Set(visibleItems.map((item) => item.id)),
    [visibleItems],
  )

  const selected = selectedId === null ? null : items.find((item) => item.id === selectedId) ?? null
  const selectedIndex = selectedId === null ? -1 : visibleItems.findIndex((item) => item.id === selectedId)
  const seenCount = items.filter((item) => item.status === 'Visto').length

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selectedId !== null) return
      const target = event.target as HTMLElement | null
      const typing =
        !!target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
      if (typing) return
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        spinRef.current?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  // La URL refleja siempre los filtros y la ficha abierta: se puede compartir.
  useEffect(() => {
    const params = new URLSearchParams()
    if (format !== 'Todos') params.set('tipo', format)
    if (status !== 'Todos') params.set('estado', status)
    if (query.trim()) params.set('buscar', query.trim())
    if (favoritesOnly) params.set('favoritos', '1')
    if (sort !== 'archivo') params.set('orden', sort)
    if (view !== 'grid') params.set('vista', view)
    const search = params.toString()
    const hash = selectedId ? `#ficha-${selectedId}` : ''
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${hash}`,
    )
  }, [format, status, query, favoritesOnly, sort, view, selectedId])

  useEffect(() => {
    const onPop = () => {
      const url = readUrl()
      setFormat(url.tipo ?? 'Todos')
      setStatus(url.estado ?? 'Todos')
      setQuery(url.buscar ?? '')
      setFavoritesOnly(url.favoritos ?? false)
      setSelectedId(url.ficha ?? null)
      if (url.orden) setSort(url.orden)
      if (url.vista) setView(url.vista)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [setSort])

  const toggleFavorite = useCallback(
    (id: number) => {
      captureFlip()
      setFavorites((previous) =>
        previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
      )
    },
    [captureFlip, setFavorites],
  )

  const changeStatus = useCallback(
    (id: number, next: MediaStatus) => {
      captureFlip()
      setOverrides((previous) => ({ ...previous, [id]: { ...previous[id], status: next } }))
    },
    [captureFlip, setOverrides],
  )

  const changeNote = useCallback(
    (id: number, note: string) => {
      setOverrides((previous) => ({ ...previous, [id]: { ...previous[id], note } }))
    },
    [setOverrides],
  )

  const rateItem = useCallback(
    (id: number, rating: number) => {
      setOverrides((previous) => {
        const current = { ...(previous[id] ?? {}) }
        if (rating <= 0) delete current.rating
        else current.rating = rating
        return { ...previous, [id]: current }
      })
    },
    [setOverrides],
  )

  const addToPlanner = useCallback(
    (id: number) => {
      setPlanner((previous) =>
        previous.some((entry) => entry.id === id) ? previous : [...previous, { id, note: '' }],
      )
    },
    [setPlanner],
  )

  const removeFromPlanner = useCallback(
    (id: number) => {
      setPlanner((previous) => previous.filter((entry) => entry.id !== id))
    },
    [setPlanner],
  )

  const togglePlanner = useCallback(
    (id: number) => {
      setPlanner((previous) =>
        previous.some((entry) => entry.id === id)
          ? previous.filter((entry) => entry.id !== id)
          : [...previous, { id, note: '' }],
      )
    },
    [setPlanner],
  )

  const changePlannerNote = useCallback(
    (id: number, note: string) => {
      setPlanner((previous) =>
        previous.map((entry) => (entry.id === id ? { ...entry, note } : entry)),
      )
    },
    [setPlanner],
  )

  const movePlanner = useCallback(
    (from: number, to: number) => {
      setPlanner((previous) => {
        const next = [...previous]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        return next
      })
    },
    [setPlanner],
  )

  const onRouletteWin = useCallback(
    (id: number) => {
      setHistory((previous) => [...previous.filter((value) => value !== id), id].slice(-5))
    },
    [setHistory],
  )

  const resetFilters = () => {
    captureFlip()
    setFormat('Todos')
    setStatus('Todos')
    setQuery('')
    setFavoritesOnly(false)
  }

  const backupData: LocalData = { favorites, planner, overrides, sort, history }

  const importBackup = (data: LocalData) => {
    captureFlip()
    setFavorites(data.favorites)
    setPlanner(data.planner)
    setOverrides(data.overrides)
    setSort(data.sort)
    setHistory(data.history)
  }

  const resetAll = () => {
    captureFlip()
    setFavorites([])
    setPlanner([])
    setOverrides({})
    setSort('archivo')
    setHistory([])
  }

  const hasFilters =
    format !== 'Todos' || status !== 'Todos' || query !== '' || favoritesOnly

  return (
    <div className="min-h-screen bg-ink text-bone">
      {booting && <Preloader reduced={reduced} onDone={() => setBooting(false)} />}

      <SiteHeader total={items.length} favorites={favorites.length} seen={seenCount} />

      <main>
        <Hero
          items={items}
          format={format}
          status={status}
          query={query}
          favoritesOnly={favoritesOnly}
          favorites={favorites}
          history={history}
          onWin={onRouletteWin}
          spinRef={spinRef}
          onOpen={(item) => setSelectedId(item.id)}
          reduced={reduced}
        />

        <section id="cartelera" className="px-5 pb-20 pt-16 md:px-10 md:pb-28">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mono text-neon">LA FILA DE ESPERA</div>
                <h2 className="display mt-2 text-5xl md:text-7xl">TODOS LOS TÍTULOS</h2>
              </div>
              <p className="mono text-muted">
                ORDEN: {sort.toUpperCase()} / 001 — {String(items.length).padStart(3, '0')}
              </p>
            </div>

            <FilterDock
              format={format}
              onFormat={setFormat}
              status={status}
              onStatus={setStatus}
              query={query}
              onQuery={setQuery}
              favoritesOnly={favoritesOnly}
              onFavoritesOnly={setFavoritesOnly}
              sort={sort}
              onSort={setSort}
              searchRef={searchRef}
              view={view}
              onView={setView}
              count={visibleItems.length}
              total={items.length}
              onBeforeChange={captureFlip}
            />

            {visibleItems.length === 0 ? (
              <div className="border border-dashed border-white/20 py-24 text-center">
                <div className="display text-4xl text-bone">SALA VACÍA</div>
                <p className="mt-3 text-sm text-muted">
                  Ningún título cumple esa combinación. Prueba con otros filtros.
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mono mt-6 border border-neon px-5 py-3 text-neon hover:bg-neon hover:text-ink"
                  >
                    LIMPIAR FILTROS
                  </button>
                )}
              </div>
            ) : view === 'grid' ? (
              <MediaGrid
                items={sortedCatalog}
                visibleIds={visibleIds}
                flipState={flipState}
                favorites={favorites}
                onOpen={(item) => setSelectedId(item.id)}
                onToggleFavorite={toggleFavorite}
                reduced={reduced}
              />
            ) : (
              <MediaListView
                items={sortedCatalog}
                visibleIds={visibleIds}
                favorites={favorites}
                onOpen={(item) => setSelectedId(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </div>
        </section>

        <Planner
          items={items}
          planner={planner}
          onAdd={addToPlanner}
          onRemove={removeFromPlanner}
          onNote={changePlannerNote}
          onMove={movePlanner}
          onOpen={(item) => setSelectedId(item.id)}
        />

        <StatsSection items={items} favorites={favorites.length} reduced={reduced} />

        <footer className="border-t border-white/10 px-5 py-10 md:px-10">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex flex-wrap items-center justify-between gap-4 mono text-muted">
              <span>FACTIBLE · CREA TU CARTELERA</span>
              <span>HECHO SIN BASE DE DATOS · SOLO ARCHIVOS Y UN POCO DE CINE</span>
              <a href="#top" className="text-neon hover:underline">VOLVER ARRIBA ↑</a>
            </div>
            <DataBackup data={backupData} onImport={importBackup} onReset={resetAll} />
          </div>
        </footer>
      </main>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
          className="fixed bottom-5 left-5 z-40 border border-neon bg-ink px-3 py-3 mono text-neon transition-colors hover:bg-neon hover:text-ink"
        >
          ↑ ARRIBA
        </button>
      )}

      <Stickers reduced={reduced} />

      {selected && (
        <TicketModal
          item={selected}
          favorite={favorites.includes(selected.id)}
          inPlanner={planner.some((entry) => entry.id === selected.id)}
          total={items.length}
          reduced={reduced}
          canPrev={selectedIndex > 0}
          canNext={selectedIndex >= 0 && selectedIndex < visibleItems.length - 1}
          rating={selected.rating}
          onRate={rateItem}
          onPrev={() => openVisibleAt(selectedIndex - 1)}
          onNext={() => openVisibleAt(selectedIndex + 1)}
          onTogglePlanner={togglePlanner}
          onClose={() => setSelectedId(null)}
          onToggleFavorite={toggleFavorite}
          onNoteChange={changeNote}
          onStatusChange={changeStatus}
        />
      )}
    </div>
  )

  function openVisibleAt(index: number) {
    const item = visibleItems[index]
    if (item) setSelectedId(item.id)
  }
}
