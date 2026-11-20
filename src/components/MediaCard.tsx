import { useState } from 'react'
import { collectionById, getDisplayTitle, getYear } from '../data/catalog'
import type { MediaItem } from '../data/catalog'

interface Props {
  item: MediaItem
  favorite: boolean
  visible: boolean
  onOpen: (item: MediaItem) => void
  onToggleFavorite: (id: number) => void
}

export function MediaCard({ item, favorite, visible, onOpen, onToggleFavorite }: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const collection = collectionById[item.collection]

  return (
    <article
      className={`poster-card media-card aspect-[2/3] border border-white/10 ${visible ? '' : 'hidden'}`}
      data-seen={item.status === 'Visto'}
      style={{ borderTop: `2px solid ${collection.color}`, backgroundColor: `${collection.color}18` }}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="absolute inset-0 z-[3] block h-full w-full text-left"
        aria-label={`Abrir ficha de ${getDisplayTitle(item)}`}
      >
        {failed ? (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center"
            style={{ background: `linear-gradient(150deg, ${collection.color}33, #08080a 70%)` }}
          >
            <span className="text-4xl" style={{ color: collection.color }}>✳</span>
            <span className="display text-lg leading-tight text-bone">{getDisplayTitle(item)}</span>
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={`Póster de ${getDisplayTitle(item)}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover transition-all duration-700 ease-cinema ${
              loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md'
            }`}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 p-3">
          <h3 className="display text-lg leading-none text-bone md:text-2xl">
            {getDisplayTitle(item)}
          </h3>
          <div className="mono mt-2 flex items-center gap-2 text-white/60">
            <span>{getYear(item)}</span>
            <span className="text-neon">/</span>
            <span>{item.type}</span>
          </div>
        </div>
      </button>

      <span className="pointer-events-none absolute left-2 top-2 z-10 mono text-white/70">
        #{String(item.id).padStart(3, '0')}
      </span>

      <button
        type="button"
        onClick={() => onToggleFavorite(item.id)}
        aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        aria-pressed={favorite}
        className={`absolute right-2 top-2 z-[4] grid h-8 w-8 place-items-center border text-sm transition-colors ${
          favorite
            ? 'border-neon bg-neon text-ink'
            : 'border-white/20 bg-ink/60 text-white/60 hover:border-neon hover:text-neon'
        }`}
      >
        ♥
      </button>
    </article>
  )
}
