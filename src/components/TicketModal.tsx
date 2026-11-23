import { useEffect, useRef } from 'react'
import { animate, spring } from 'animejs'
import { gsap, useGSAP } from '../lib/gsap'
import { useAnimeScope } from '../hooks/useAnimeScope'
import { getOriginalTitle, getYear, tmdbPaths } from '../data/catalog'
import type { MediaItem, MediaStatus } from '../data/catalog'

interface Props {
  item: MediaItem
  favorite: boolean
  inPlanner: boolean
  total: number
  reduced: boolean
  canPrev: boolean
  canNext: boolean
  rating?: number
  onRate: (id: number, rating: number) => void
  onPrev: () => void
  onNext: () => void
  onTogglePlanner: (id: number) => void
  onClose: () => void
  onToggleFavorite: (id: number) => void
  onNoteChange: (id: number, note: string) => void
  onStatusChange: (id: number, status: MediaStatus) => void
}

export function TicketModal({
  item,
  favorite,
  inPlanner,
  total,
  reduced,
  canPrev,
  canNext,
  rating,
  onRate,
  onPrev,
  onNext,
  onTogglePlanner,
  onClose,
  onToggleFavorite,
  onNoteChange,
  onStatusChange,
}: Props) {
  const root = useRef<HTMLDivElement>(null)
  const runAnime = useAnimeScope(root)
  const tmdbUrl = tmdbPaths[item.id]
    ? `https://www.themoviedb.org${tmdbPaths[item.id]}`
    : `https://www.themoviedb.org/search?query=${encodeURIComponent(getOriginalTitle(item) || item.title)}`

  const restoreFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!restoreFocus.current) restoreFocus.current = document.activeElement as HTMLElement
    return () => restoreFocus.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'ArrowLeft' && canPrev) {
        event.preventDefault()
        onPrev()
      }
      if (event.key === 'ArrowRight' && canNext) {
        event.preventDefault()
        onNext()
      }
      if (event.key === 'Tab') {
        const focusables = root.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, textarea, select, a[href]',
        )
        if (!focusables?.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext, canPrev, canNext])

  useGSAP(
    () => {
      if (reduced) return
      gsap
        .timeline()
        .from('.ticket-backdrop', { autoAlpha: 0, duration: 0.25 })
        .from(
          '.ticket',
          { autoAlpha: 0, y: 50, rotate: -3, scale: 0.9, duration: 0.65, ease: 'expo.out' },
          '-=0.1',
        )
        .from(
          '.ticket-reveal',
          { autoAlpha: 0, y: 14, duration: 0.4, stagger: 0.06, ease: 'power2.out' },
          '-=0.35',
        )
    },
    { scope: root },
  )

  useEffect(() => {
    if (reduced) return
    runAnime(() => {
      animate('.ticket-seal', {
        rotate: [0, 12, -8, 0],
        scale: [0.6, 1],
        ease: spring({ bounce: 0.6, duration: 700 }),
        delay: 220,
      })
    })
  }, [reduced, runAnime])

  return (
    <div ref={root} tabIndex={-1} className="fixed inset-0 z-[90] grid place-items-center p-3 md:p-6 focus:outline-none">
      <button
        type="button"
        onClick={onClose}
        className="ticket-backdrop absolute inset-0 cursor-default bg-black/85 backdrop-blur-md"
        aria-label="Cerrar ficha"
      />

      <div className="ticket relative z-10 grid max-h-[92vh] w-full max-w-4xl overflow-y-auto md:grid-cols-[220px_1fr_112px]">
        {/* Póster */}
        <div className="relative min-h-[200px] border-b border-white/10 md:border-b-0 md:border-r">
          <img
            src={item.imageUrl}
            alt={`Póster de ${item.title}`}
            className="h-full max-h-[420px] w-full object-cover md:max-h-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent md:bg-gradient-to-r" />
          <div className="absolute bottom-3 left-3 mono text-white/70">
            Nº {String(item.id).padStart(3, '0')} / {total}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 md:p-7">
          <div className="ticket-reveal mono text-neon">FICHA TÉCNICA — ADMISIÓN ÚNICA</div>
          <h2 className="ticket-reveal display mt-2 text-4xl leading-[0.95] text-bone md:text-5xl">
            {item.title.replace(/^\[.*?\]\s*/, '').replace(/\s*\(\d{4}\)\s*$/, '')}
          </h2>
          <div className="ticket-reveal mono mt-2 text-muted">
            {getOriginalTitle(item)} · {getYear(item)}
          </div>

          <dl className="ticket-reveal mt-6 grid grid-cols-2 gap-px border border-white/10 bg-white/10 text-xs sm:grid-cols-4">
            {[
              ['FORMATO', item.type],
              ['AÑO', getYear(item)],
              ['ESTADO', item.status],
              ['NOTA', rating ? `${rating}/5 ★` : '—'],
            ].map(([label, value]) => (
              <div key={label} className="bg-ink-2 p-3">
                <dt className="mono text-muted">{label}</dt>
                <dd className="mt-1 text-sm leading-tight text-bone">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="ticket-reveal mt-5 flex items-center justify-between gap-3 border-y border-white/10 py-2 mono">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              className="text-muted transition-colors hover:text-neon disabled:cursor-default disabled:opacity-30"
            >
              ← ANTERIOR
            </button>
            <span className="hidden text-muted/60 sm:inline">USA ← → PARA NAVEGAR</span>
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className="text-muted transition-colors hover:text-neon disabled:cursor-default disabled:opacity-30"
            >
              SIGUIENTE →
            </button>
          </div>

          <div className="ticket-reveal mt-4 flex flex-wrap items-center gap-3">
            <span className="mono text-muted">TU NOTA</span>
            <div className="flex gap-1" role="group" aria-label="Valoración de 1 a 5 estrellas">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRate(item.id, star)}
                  aria-label={`★ ${star} estrellas`}
                  aria-pressed={rating === star}
                  className={`text-2xl leading-none transition-colors ${
                    rating && star <= rating ? 'text-neon' : 'text-white/25 hover:text-bone'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {Boolean(rating) && (
              <button
                type="button"
                onClick={() => onRate(item.id, 0)}
                className="mono text-muted underline decoration-white/20 underline-offset-4 hover:text-neon"
              >
                QUITAR
              </button>
            )}
            <a
              href={tmdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mono ml-auto text-muted underline decoration-neon underline-offset-4 hover:text-neon"
            >
              ↗ VER EN TMDB
            </a>
          </div>

          <div className="ticket-reveal mt-6">
            <label htmlFor="ticket-note" className="mono text-neon">RESEÑA DE FACTIBLE</label>
            <textarea
              id="ticket-note"
              value={item.note}
              onChange={(event) => onNoteChange(item.id, event.target.value)}
              rows={3}
              className="mt-2 w-full resize-y border border-white/15 bg-black/40 p-3 text-sm leading-relaxed text-bone focus:border-neon focus:outline-none"
            />
            <p className="mono mt-1 text-muted">Se guarda automáticamente en este navegador.</p>
          </div>

          <div className="ticket-reveal mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onStatusChange(item.id, item.status === 'Visto' ? 'Por ver' : 'Visto')}
              className="border border-white/25 px-4 py-3 mono text-bone transition-colors hover:border-neon hover:text-neon"
            >
              {item.status === 'Visto' ? '↺ VOLVER A PENDIENTE' : '✓ MARCAR COMO VISTO'}
            </button>
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              aria-pressed={favorite}
              className={`border px-4 py-3 mono transition-colors ${
                favorite ? 'border-neon bg-neon/15 text-neon' : 'border-white/25 text-muted hover:text-neon'
              }`}
            >
              {favorite ? '♥ EN FAVORITOS' : '♡ AÑADIR A FAVORITOS'}
            </button>
            <button
              type="button"
              onClick={() => onTogglePlanner(item.id)}
              aria-pressed={inPlanner}
              className={`border px-4 py-3 mono transition-colors ${
                inPlanner
                  ? 'border-bone bg-bone/10 text-bone'
                  : 'border-white/25 text-muted hover:border-bone hover:text-bone'
              }`}
            >
              {inPlanner ? '✓ EN MI PLAN' : '＋ AÑADIR A MI PLAN'}
            </button>
          </div>
        </div>

        {/* Talón */}
        <div className="ticket-stub relative flex min-h-[120px] flex-col items-center justify-between gap-4 p-4 md:min-h-0">
          <div className="ticket-seal grid h-14 w-14 place-items-center rounded-full border-2 border-bone/70 text-2xl text-bone">
            ✳
          </div>
          <div className="mono hidden text-center leading-loose text-bone/80 [writing-mode:vertical-rl] md:block">
            FACTIBLE · CREA TU CARTELERA · {String(item.id).padStart(3, '0')}
          </div>
          <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,#f4eee7_0_2px,transparent_2px_5px)] opacity-70" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute -right-3 -top-3 z-20 grid h-9 w-9 place-items-center border border-neon bg-ink text-lg text-neon hover:bg-neon hover:text-ink"
          aria-label="× Cerrar ficha"
        >
          ×
        </button>
      </div>
    </div>
  )
}
