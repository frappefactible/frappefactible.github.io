import { useCallback, useMemo, useRef, useState } from 'react'
import { Flip } from './lib/gsap'
import { catalog } from './data/catalog'
import type { CollectionId, MediaItem, MediaStatus } from './data/catalog'
import { usePersistentState } from './hooks/usePersistentState'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useLenis } from './hooks/useLenis'
import { Preloader } from './components/Preloader'
import { SiteHeader } from './components/SiteHeader'
import { Hero } from './components/Hero'
import { CollectionStrip } from './components/CollectionStrip'
import { FilterDock } from './components/FilterDock'
import type { FormatFilter, StatusFilter } from './components/FilterDock'
import { MediaGrid } from './components/MediaGrid'
import { TicketModal } from './components/TicketModal'
import { StatsSection } from './components/StatsSection'
import { Stickers } from './components/Stickers'

type Overrides = Record<number, Partial<Pick<MediaItem, 'status' | 'note'>>>

const ANIME_TYPES = ['Anime', 'Película Anime', 'OVA', 'Manga']
const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function App() {
  const reduced = useReducedMotion()
  useLenis(!reduced)

  const [booting, setBooting] = useState(true)
  const [format, setFormat] = useState<FormatFilter>('Todos')
  const [status, setStatus] = useState<StatusFilter>('Todos')
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [collection, setCollection] = useState<CollectionId | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const [favorites, setFavorites] = usePersistentState<number[]>('factible:favorites:v1', [])
  const [overrides, setOverrides] = usePersistentState<Overrides>('factible:overrides:v1', {})

  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null)

  const items = useMemo(
    () => catalog.map((item) => ({ ...item, ...overrides[item.id] })),
    [overrides],
  )

  /** Captura la posición de las tarjetas ANTES de que React reordene el grid. */
  const captureFlip = useCallback(() => {
    if (!reduced) flipState.current = Flip.getState('.media-card')
  }, [reduced])

  const visibleItems = useMemo(() => {
    const term = normalize(query.trim())
    return items.filter((item) => {
      if (format === 'Películas' && item.type !== 'Película') return false
      if (format === 'Series' && item.type !== 'Serie') return false
      if (format === 'Animes' && !ANIME_TYPES.includes(item.type)) return false
      if (status !== 'Todos' && item.status !== status) return false
      if (collection && item.collection !== collection) return false
      if (favoritesOnly && !favorites.includes(item.id)) return false
      if (term && !normalize(item.title).includes(term)) return false
      return true
    })
  }, [items, format, status, collection, favoritesOnly, favorites, query])

  const visibleIds = useMemo(
    () => new Set(visibleItems.map((item) => item.id)),
    [visibleItems],
  )

  const collectionCounts = useMemo(() => {
    const counts = {} as Record<CollectionId, number>
    for (const item of items) counts[item.collection] = (counts[item.collection] ?? 0) + 1
    return counts
  }, [items])

  const selected = selectedId === null ? null : items.find((item) => item.id === selectedId) ?? null
  const seenCount = items.filter((item) => item.status === 'Visto').length

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

  const resetFilters = () => {
    captureFlip()
    setFormat('Todos')
    setStatus('Todos')
    setQuery('')
    setFavoritesOnly(false)
    setCollection(null)
  }

  const hasFilters =
    format !== 'Todos' || status !== 'Todos' || query !== '' || favoritesOnly || collection !== null

  return (
    <div className="min-h-screen bg-ink text-bone">
      {booting && <Preloader reduced={reduced} onDone={() => setBooting(false)} />}

      <SiteHeader total={items.length} favorites={favorites.length} seen={seenCount} />

      <main>
        <Hero items={items} onOpen={(item) => setSelectedId(item.id)} reduced={reduced} />

        <CollectionStrip
          active={collection}
          counts={collectionCounts}
          onSelect={setCollection}
          onBeforeChange={captureFlip}
        />

        <section id="cartelera" className="px-5 pb-20 pt-16 md:px-10 md:pb-28">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mono text-neon">LA FILA DE ESPERA</div>
                <h2 className="display mt-2 text-5xl md:text-7xl">TODOS LOS TÍTULOS</h2>
              </div>
              <p className="mono text-muted">ORDEN: ARCHIVO / 001 — 093</p>
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
              count={visibleItems.length}
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
            ) : (
              <MediaGrid
                items={items}
                visibleIds={visibleIds}
                flipState={flipState}
                favorites={favorites}
                onOpen={(item) => setSelectedId(item.id)}
                onToggleFavorite={toggleFavorite}
                reduced={reduced}
              />
            )}
          </div>
        </section>

        <StatsSection items={items} favorites={favorites.length} reduced={reduced} />

        <footer className="border-t border-white/10 px-5 py-10 md:px-10">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 mono text-muted">
            <span>FACTIBLE · CARTELERA NOCTURNA</span>
            <span>HECHO SIN BASE DE DATOS · SOLO ARCHIVOS Y UN POCO DE OBSESIÓN</span>
            <a href="#top" className="text-neon hover:underline">VOLVER ARRIBA ↑</a>
          </div>
        </footer>
      </main>

      <Stickers reduced={reduced} />

      {selected && (
        <TicketModal
          item={selected}
          favorite={favorites.includes(selected.id)}
          reduced={reduced}
          onClose={() => setSelectedId(null)}
          onToggleFavorite={toggleFavorite}
          onNoteChange={changeNote}
          onStatusChange={changeStatus}
        />
      )}
    </div>
  )
}
