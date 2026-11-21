import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { animate, spring, stagger } from 'animejs'
import { gsap, useGSAP } from '../lib/gsap'
import { useAnimeScope } from '../hooks/useAnimeScope'
import { getDisplayTitle, getOriginalTitle, getYear } from '../data/catalog'
import type { MediaItem } from '../data/catalog'
import type { FormatFilter, StatusFilter } from './FilterDock'

interface Props {
  items: MediaItem[]
  format: FormatFilter
  status: StatusFilter
  query: string
  favoritesOnly: boolean
  favorites: number[]
  history: number[]
  onWin: (id: number) => void
  spinRef: RefObject<(() => void) | null>
  onOpen: (item: MediaItem) => void
  reduced: boolean
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const shuffle = <T,>(array: T[]): T[] => {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const pickRandom = (pool: MediaItem[]): MediaItem =>
  pool[Math.floor(Math.random() * pool.length)]

export function Hero({
  items,
  format,
  status,
  query,
  favoritesOnly,
  favorites,
  history,
  onWin,
  spinRef,
  onOpen,
  reduced,
}: Props) {
  const root = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const runAnime = useAnimeScope(root)
  const timers = useRef<number[]>([])

  const pending = useMemo(() => items.filter((item) => item.status === 'Por ver'), [items])

  // La ruleta respeta los filtros activos y evita repetir ganadores recientes.
  const contextual = useMemo(() => {
    const term = normalize(query.trim())
    return pending.filter((item) => {
      if (format === 'Películas' && item.type !== 'Película') return false
      if (format === 'Series' && item.type !== 'Serie') return false
      if (format === 'Animes' && !['Anime', 'Película Anime', 'OVA', 'Manga'].includes(item.type)) return false
      if (status !== 'Todos' && item.status !== status) return false
      if (favoritesOnly && !favorites.includes(item.id)) return false
      if (term && !normalize(item.title).includes(term)) return false
      return true
    })
  }, [pending, format, status, query, favoritesOnly, favorites])

  const recent = history.slice(-5)
  const fresh = contextual.filter((item) => !recent.includes(item.id))
  const roulettePool = fresh.length ? fresh : contextual
  const usingFallback = contextual.length === 0 && pending.length > 0
  // Sugerencia aleatoria en cada carga de página (prioriza títulos pendientes).
  const [spotlight, setSpotlight] = useState<MediaItem>(() =>
    pickRandom(pending.length ? pending : items),
  )

  const [candidates, setCandidates] = useState<MediaItem[]>(() => shuffle(pending).slice(0, 5))
  const [active, setActive] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<MediaItem | null>(null)

  useEffect(
    () => () => {
      timers.current.forEach((id) => {
        window.clearInterval(id)
        window.clearTimeout(id)
      })
    },
    [],
  )

  useGSAP(
    (_context, maybeContextSafe) => {
      const el = spotlightRef.current
      if (!el || reduced) return
      const contextSafe = maybeContextSafe!

      const onMove = contextSafe((event: PointerEvent) => {
        const rect = el.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        gsap.to(el, {
          rotateY: x * 16,
          rotateX: -y * 12,
          transformPerspective: 900,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
      const onLeave = contextSafe(() => {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)' })
      })

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: root, dependencies: [reduced] },
  )

  const spin = () => {
    if (spinning || roulettePool.length === 0) return
    setSpinning(true)
    setWinner(null)

    const pool = shuffle(roulettePool).slice(0, 5)
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    const chosenIndex = pool.indexOf(chosen)
    setCandidates(pool)
    setActive(0)

    if (reduced) {
      setActive(chosenIndex)
      setWinner(chosen)
      setSpinning(false)
      onWin(chosen.id)
      return
    }

    runAnime(() => {
      animate('.reel-chip', {
        translateY: [{ from: 24, to: 0 }],
        opacity: [{ from: 0, to: 1 }],
        delay: stagger(55),
        duration: 280,
        ease: 'out(3)',
      })
    })

    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % pool.length)
    }, 110)

    const end = window.setTimeout(() => {
      window.clearInterval(interval)
      setActive(chosenIndex)
      setWinner(chosen)
      setSpinning(false)
      onWin(chosen.id)
    }, 1450)

    // Espera a que React aplique el estado ganador antes de animar su fila.
    const reveal = window.setTimeout(() => {
      runAnime(() => {
        const chip = root.current?.querySelector(`.reel-chip[data-id="${chosen.id}"]`)
        if (chip) {
          animate(chip, {
            scale: [1, 1.14, 1],
            ease: spring({ bounce: 0.5, duration: 560 }),
          })
        }
      })
    }, 1480)

    timers.current.push(interval, end, reveal)
  }

  spinRef.current = spin

  const reroll = () => {
    const others = items.filter((item) => item.id !== spotlight.id && item.status === 'Por ver')
    const pool = others.length ? others : items.filter((item) => item.id !== spotlight.id)
    setSpotlight(pickRandom(pool))
    if (!reduced) {
      runAnime(() => {
        if (spotlightRef.current) {
          animate(spotlightRef.current, {
            scale: [0.92, 1],
            ease: spring({ bounce: 0.5, duration: 600 }),
          })
        }
      })
    }
  }

  return (
    <section ref={root} id="top" className="film-grain relative overflow-hidden px-5 pb-12 pt-16 md:px-10 md:pb-16 md:pt-20">
      {/* Halo de proyector */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-neon/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-blood/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-[1600px] items-end gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 flex items-center gap-3 mono text-neon">
            <span className="inline-block h-1.5 w-1.5 bg-neon" />
            DESCUBRE NUEVOS TITULOS
          </div>

          <h1 className="display text-[clamp(3.4rem,10.5vw,9rem)] text-bone">
            CREA TU
            <br />
            CARTELERA<span className="text-neon text-glow">.</span>
          </h1>

          <div className="mt-6 flex max-w-xl flex-col gap-4 border-l border-neon/60 pl-6">
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Mi lista de películas, series y animes por ver. Sin algoritmos que decidan por mí:
              una ruleta para los días de indecisión y un plan para no perderte nada.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 mono text-muted">
              <span><b className="text-bone">{items.length}</b> TÍTULOS</span>
              <span><b className="text-bone">6</b> FORMATOS</span>
              <span><b className="text-bone">1</b> RULETA</span>
            </div>
          </div>
        </div>

        <div className="grid items-stretch gap-6 sm:grid-cols-[1.1fr_0.9fr]">
          {/* Spotlight con tilt 3D */}
          <div className="relative h-[460px] [perspective:900px] md:h-[480px]">
            <button
              type="button"
              onClick={() => spotlight && onOpen(spotlight)}
              className="group block h-full w-full text-left"
              aria-label={`Abrir ficha de ${getDisplayTitle(spotlight)}`}
            >
              <div
                ref={spotlightRef}
                className="poster-card relative h-full w-full overflow-hidden border border-white/15 [transform-style:preserve-3d]"
              >
                <img
                  src={spotlight.imageUrl}
                  alt={getDisplayTitle(spotlight)}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                  <div className="display text-2xl leading-none text-bone sm:text-3xl">
                    {getDisplayTitle(spotlight)}
                  </div>
                  <div className="mono mt-2 text-white/60">
                    {getOriginalTitle(spotlight)} · {getYear(spotlight)}
                  </div>
                </div>
                <div className="absolute left-3 top-3 z-10 border border-neon bg-ink/80 px-2 py-1 mono text-neon">
                  SUGERENCIA DEL DÍA
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={reroll}
              aria-label="Ver otra sugerencia"
              title="Otra sugerencia"
              className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center border border-neon bg-ink/90 text-lg text-neon transition-colors hover:bg-neon hover:text-ink"
            >
              ↻
            </button>
          </div>

          {/* Ruleta */}
          <div className="flex h-[460px] flex-col justify-between overflow-hidden border border-white/15 bg-ink-2/70 p-4 backdrop-blur md:h-[480px]">
            <div>
              <div className="mono text-neon">¿QUÉ VEO HOY?</div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Gira la ruleta: el archivo decide entre tus pendientes, sin repetir ganadores.
              </p>
              <p
                className={`mono mt-2 h-4 text-neon/80 ${usingFallback ? '' : 'invisible'}`}
                aria-live="polite"
              >
                SIN COINCIDENCIAS · USANDO TODO EL ARCHIVO
              </p>
            </div>

            <div className="my-3 space-y-1.5" aria-live="polite">
              {Array.from({ length: 5 }).map((_, index) => {
                const candidate = candidates[index]
                if (!candidate) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="reel-chip mono flex h-9 items-center border-l-2 border-white/5 px-2 text-muted/30"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')} —
                    </div>
                  )
                }
                return (
                  <div
                    key={candidate.id}
                    data-id={candidate.id}
                    className={`reel-chip mono flex h-9 items-start gap-2 border-l-2 px-2 py-1 transition-all duration-200 ${
                      index === active
                        ? 'is-active border-neon bg-neon/10 text-bone'
                        : 'border-white/10 text-muted/70'
                    }`}
                    title={candidate.title}
                  >
                    <span className="shrink-0">{String(index + 1).padStart(2, '0')}</span>
                    <span className="line-clamp-2 text-[11px] leading-[1.25]">
                      {getDisplayTitle(candidate)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Espacio reservado: el panel no cambia de altura al salir el ganador. */}
            <div
              className={`mb-3 h-[92px] border border-neon/50 bg-neon/5 p-2.5 ${winner ? '' : 'invisible'}`}
              aria-live="polite"
            >
              <div className="mono text-neon">LA SUERTE HA HABLADO</div>
              <div className="display mt-1 line-clamp-2 text-lg leading-tight text-bone">
                {winner ? getDisplayTitle(winner) : ''}
              </div>
              {winner && (
                <button
                  type="button"
                  onClick={() => onOpen(winner)}
                  className="mono mt-2 text-white/70 underline decoration-neon underline-offset-4 hover:text-neon"
                >
                  Ver ficha →
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={spin}
              disabled={spinning || roulettePool.length === 0}
              className="neon-glow w-full bg-neon px-4 py-3 font-display text-xl tracking-wide text-ink transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            >
              {spinning ? 'GIRANDO…' : 'GIRAR LA RULETA'}
            </button>
          </div>
        </div>
      </div>

      {/* Ticker de celuloide */}
      <div className="ticker-mask relative mx-auto mt-16 max-w-[1600px] overflow-hidden border-y border-white/10 py-3">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 mono text-muted">
          {Array.from({ length: 2 }).map((_, repeat) => (
            <span key={repeat} className="flex gap-10 whitespace-nowrap">
              {['PELÍCULAS', 'SERIES', 'ANIMES', 'OVA', 'MANGA', 'RULETA', 'RESEÑAS', 'FAVORITOS', 'MI PLAN'].map(
                (word) => (
                  <span key={word} className="flex items-center gap-10">
                    {word} <span className="text-neon">✳</span>
                  </span>
                ),
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
