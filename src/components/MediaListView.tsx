import { collectionById, getDisplayTitle, getYear } from '../data/catalog'
import type { MediaItem } from '../data/catalog'

interface Props {
  items: MediaItem[]
  visibleIds: Set<number>
  favorites: number[]
  onOpen: (item: MediaItem) => void
  onToggleFavorite: (id: number) => void
}

export function MediaListView({ items, visibleIds, favorites, onOpen, onToggleFavorite }: Props) {
  const visible = items.filter((item) => visibleIds.has(item.id))

  return (
    <div className="border border-white/10 bg-ink">
      <div className="hidden grid-cols-[52px_64px_1fr_80px_120px_180px_90px] items-center gap-3 border-b border-white/10 px-4 py-2 mono text-muted md:grid">
        <span>Nº</span><span /> <span>TÍTULO</span><span>AÑO</span><span>FORMATO</span><span>COLECCIÓN</span><span>ESTADO</span>
      </div>

      {visible.map((item) => {
        const collection = collectionById[item.collection]
        const isFavorite = favorites.includes(item.id)
        return (
          <div
            key={item.id}
            className="grid grid-cols-[36px_48px_1fr_auto] items-center gap-3 border-b border-white/[0.06] px-3 py-2 transition-colors hover:bg-white/[0.04] md:grid-cols-[52px_64px_1fr_80px_120px_180px_90px] md:px-4"
          >
            <span className="mono text-muted">#{String(item.id).padStart(3, '0')}</span>
            <button type="button" onClick={() => onOpen(item)} aria-label={`Abrir ficha de ${getDisplayTitle(item)}`}>
              <img src={item.imageUrl} alt="" loading="lazy" className="h-16 w-11 object-cover md:h-14" />
            </button>
            <button type="button" onClick={() => onOpen(item)} className="min-w-0 text-left">
              <span className="block truncate font-display text-base uppercase leading-none text-bone md:text-lg">
                {getDisplayTitle(item)}
              </span>
              <span className="mono mt-1 block truncate text-muted md:hidden">
                {getYear(item)} · {item.type}
              </span>
              {Boolean(item.rating) && (
                <span className="mono mt-1 block text-neon">{'★'.repeat(item.rating ?? 0)}</span>
              )}
            </button>
            <span className="hidden mono text-muted md:block">{getYear(item)}</span>
            <span className="hidden mono text-muted md:block">{item.type}</span>
            <span className="hidden truncate mono md:block" style={{ color: collection.color }}>
              {collection.glyph} {collection.name}
            </span>
            <div className="flex items-center gap-2">
              <span className={`hidden mono md:inline ${item.status === 'Visto' ? 'text-neon' : 'text-muted'}`}>
                {item.status.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                aria-pressed={isFavorite}
                className={`text-lg leading-none ${isFavorite ? 'text-neon' : 'text-white/30 hover:text-neon'}`}
              >
                ♥
              </button>
            </div>
          </div>
        )
      })}

      {visible.length === 0 && (
        <p className="mono py-16 text-center text-muted">SIN RESULTADOS</p>
      )}
    </div>
  )
}
