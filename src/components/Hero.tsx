import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, spring, stagger } from 'animejs'
import { gsap, useGSAP } from '../lib/gsap'
import { useAnimeScope } from '../hooks/useAnimeScope'
import { collectionById, getDisplayTitle, getOriginalTitle, getYear } from '../data/catalog'
import type { MediaItem } from '../data/catalog'

interface Props {
  items: MediaItem[]
  onOpen: (item: MediaItem) => void
  reduced: boolean
}

const shuffle = <T,>(array: T[]): T[] => {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function Hero({ items, onOpen, reduced }: Props) {
  const root = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const runAnime = useAnimeScope(root)
  const timers = useRef<number[]>([])

  const pending = useMemo(() => items.filter((item) => item.status === 'Por ver'), [items])
  const spotlight = items.find((item) => item.id === 92) ?? items[0]
  const spotlightCollection = collectionById[spotlight.collection]

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
    if (spinning || pending.length === 0) return
    setSpinning(true)
    setWinner(null)

    const pool = shuffle(pending).slice(0, 5)
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    const chosenIndex = pool.indexOf(chosen)
    setCandidates(pool)
    setActive(0)

    if (reduced) {
      setActive(chosenIndex)
      setWinner(chosen)
      setSpinning(false)
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
      runAnime(() => {
        animate('.reel-chip.is-active', {
          scale: [1, 1.14, 1],
          ease: spring({ bounce: 0.5, duration: 560 }),
        })
      })
    }, 1450)

    timers.current.push(interval, end)
  }

  return (
    <section ref={root} id="top" className="film-grain relative overflow-hidden px-5 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32">
      {/* Halo de proyector */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-neon/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-blood/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-[1600px] items-end gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 flex items-center gap-3 mono text-neon">
            <span className="inline-block h-1.5 w-1.5 bg-neon" />
            ARCHIVO PERSONAL / FUNCIONES DE NOCHE
          </div>

          <h1 className="display text-[clamp(4.2rem,12.5vw,11rem)] text-bone">
            CARTELERA
            <br />
            NOCTURNA<span className="text-neon text-glow">.</span>
          </h1>

          <div className="mt-8 flex max-w-xl flex-col gap-5 border-l border-neon/60 pl-6">
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Mi lista de películas, series y animes por ver. Sin algoritmos que decidan por mí:
              solo obsesiones, ordenadas por tema y una ruleta para los días de indecisión.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 mono text-muted">
              <span><b className="text-bone">93</b> TÍTULOS</span>
              <span><b className="text-bone">8</b> COLECCIONES</span>
              <span><b className="text-bone">6</b> FORMATOS</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr]">
          {/* Spotlight con tilt 3D */}
          <div className="relative [perspective:900px]">
            <button
              type="button"
              onClick={() => spotlight && onOpen(spotlight)}
              className="group block w-full text-left"
              aria-label={`Abrir ficha de ${getDisplayTitle(spotlight)}`}
            >
              <div
                ref={spotlightRef}
                className="poster-card relative aspect-[2/3] w-full overflow-hidden border border-white/15 [transform-style:preserve-3d]"
              >
                <img
                  src={spotlight.imageUrl}
                  alt={getDisplayTitle(spotlight)}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                  <div className="mono mb-1" style={{ color: spotlightCollection.color }}>
                    {spotlightCollection.glyph} {spotlightCollection.name}
                  </div>
                  <div className="display text-2xl leading-none text-bone sm:text-3xl">
                    {getDisplayTitle(spotlight)}
                  </div>
                  <div className="mono mt-2 text-white/60">
                    {getOriginalTitle(spotlight)} · {getYear(spotlight)}
                  </div>
                </div>
                <div className="absolute left-3 top-3 z-10 border border-neon bg-ink/80 px-2 py-1 mono text-neon">
                  EN CARTELERA
                </div>
              </div>
            </button>
          </div>

          {/* Ruleta */}
          <div className="flex flex-col justify-between border border-white/15 bg-ink-2/70 p-5 backdrop-blur">
            <div>
              <div className="mono text-neon">¿QUÉ VEO HOY?</div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Gira la ruleta. El archivo decide por ti entre los títulos pendientes.
              </p>
            </div>

            <div className="my-5 space-y-1.5" aria-live="polite">
              {candidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className={`mono truncate border-l-2 px-2 py-1.5 transition-all duration-200 ${
                    index === active
                      ? 'reel-chip is-active border-neon bg-neon/10 text-bone'
                      : 'reel-chip border-white/10 text-muted/70'
                  }`}
                  title={candidate.title}
                >
                  {String(index + 1).padStart(2, '0')} / {getDisplayTitle(candidate)}
                </div>
              ))}
            </div>

            {winner && (
              <div className="mb-4 border border-neon/50 bg-neon/5 p-3">
                <div className="mono text-neon">LA SUERTE HA HABLADO</div>
                <div className="display mt-1 text-xl leading-tight text-bone">
                  {getDisplayTitle(winner)}
                </div>
                <button
                  type="button"
                  onClick={() => onOpen(winner)}
                  className="mono mt-2 text-white/70 underline decoration-neon underline-offset-4 hover:text-neon"
                >
                  Ver ficha →
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={spin}
              disabled={spinning || pending.length === 0}
              className="neon-glow w-full bg-neon px-4 py-4 font-display text-2xl tracking-wide text-ink transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
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
              {['PELÍCULAS', 'SERIES', 'ANIMES', 'OVA', 'MANGA', 'DEMONIOS', 'CYBERPUNK', 'GUERRA', 'DESOLACIÓN'].map(
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
