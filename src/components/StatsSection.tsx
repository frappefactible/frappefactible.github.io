import { useMemo, useRef } from 'react'
import { animate } from 'animejs'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useAnimeScope } from '../hooks/useAnimeScope'
import { collections } from '../data/catalog'
import type { MediaItem } from '../data/catalog'

interface Props {
  items: MediaItem[]
  favorites: number
  reduced: boolean
}

export function StatsSection({ items, favorites, reduced }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const runAnime = useAnimeScope(sectionRef)

  const animeCount = items.filter((item) =>
    ['Anime', 'Película Anime', 'OVA', 'Manga'].includes(item.type),
  ).length

  const metrics = useMemo(
    () => [
      { label: 'TÍTULOS EN EL ARCHIVO', value: items.length },
      { label: 'PELÍCULAS', value: items.filter((item) => item.type === 'Película').length },
      { label: 'ANIMES Y AFINES', value: animeCount },
      { label: 'SERIES', value: items.filter((item) => item.type === 'Serie').length },
      { label: 'YA VISTOS', value: items.filter((item) => item.status === 'Visto').length },
      { label: 'FAVORITOS', value: favorites },
      {
        label: 'NOTA MEDIA',
        value: (() => {
          const rated = items.filter((item) => typeof item.rating === 'number' && item.rating > 0)
          if (!rated.length) return 0
          return Math.round((rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length) * 10) / 10
        })(),
      },
    ],
    [items, animeCount, favorites],
  )

  const metricsKey = metrics.map((metric) => metric.value).join(',')
  const maxCollection = Math.max(
    ...collections.map((collection) => items.filter((item) => item.collection === collection.id).length),
    1,
  )

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const counters = gsap.utils.toArray<HTMLElement>('[data-counter]')
      const bars = gsap.utils.toArray<HTMLElement>('[data-bar]')

      const reveal = () => {
        if (reduced) {
          counters.forEach((el) => {
            el.textContent = el.dataset.target ?? '0'
          })
          bars.forEach((el) => {
            el.style.transform = `scaleX(${el.dataset.ratio ?? '0'})`
          })
          return
        }

        runAnime(() => {
          counters.forEach((el) => {
            const target = Number(el.dataset.target ?? 0)
            const state = { value: 0 }
            animate(state, {
              value: target,
              duration: 1300,
              ease: 'out(3)',
              onUpdate: () => {
                el.textContent = Number.isInteger(target)
                  ? String(Math.round(state.value))
                  : (Math.round(state.value * 10) / 10).toFixed(1)
              },
            })
          })

          bars.forEach((bar, index) => {
            animate(bar, {
              scaleX: Number(bar.dataset.ratio ?? 0),
              duration: 850,
              delay: index * 55,
              ease: 'out(3)',
            })
          })
        })
      }

      if (reduced) {
        reveal()
        return
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: reveal,
      })
      return () => trigger.kill()
    },
    { scope: sectionRef, dependencies: [metricsKey, reduced] },
  )

  return (
    <section ref={sectionRef} id="stats" className="border-t border-white/10 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mono text-neon">EL ARCHIVO EN CIFRAS</div>
            <h2 className="display mt-2 text-5xl md:text-7xl">FACTIBLE STATS</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Todo se calcula desde el catálogo. Ningún número está escrito a mano: si cambia
            un estado o una reseña, aquí se nota.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-ink p-5">
              <div
                data-counter
                data-target={metric.value}
                className="display text-5xl leading-none text-bone md:text-6xl"
              >
                0
              </div>
              <div className="mono mt-3 text-muted">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <div className="mono mb-6 text-muted">DISTRIBUCIÓN POR OBSESIÓN</div>
          <div className="space-y-3">
            {collections.map((collection) => {
              const count = items.filter((item) => item.collection === collection.id).length
              return (
                <div key={collection.id} className="grid grid-cols-[1fr_2fr_auto] items-center gap-4">
                  <span className="truncate text-xs text-bone md:text-sm">{collection.name}</span>
                  <div className="h-2 w-full bg-white/5">
                    <div
                      data-bar
                      data-ratio={(count / maxCollection).toFixed(3)}
                      className="h-full origin-left"
                      style={{ backgroundColor: collection.color, transform: 'scaleX(0)' }}
                    />
                  </div>
                  <span className="mono w-8 text-right text-muted">{String(count).padStart(2, '0')}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
