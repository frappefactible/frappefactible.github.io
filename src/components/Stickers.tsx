import { useEffect, useRef } from 'react'
import { animate, createDraggable, createScope, spring } from 'animejs'

interface Props {
  reduced: boolean
}

const REACTIONS = [
  { src: '/GIFs/filter.gif', label: 'CON FILTRO' },
  { src: '/GIFs/magpie.gif', label: 'URRACA' },
  { src: '/GIFs/sRun.gif', label: 'A TODA VELOCIDAD' },
  { src: '/GIFs/HTKyPkKXUAEIUoX.webp', label: 'REACCIÓN' },
]

export function Stickers({ reduced }: Props) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !root.current) return

    const scope = createScope({ root: root.current })
    const bounds = root.current.querySelector<HTMLElement>('.sticker-bounds')
    scope.add(() => {
      const stickers = Array.from(root.current?.querySelectorAll<HTMLElement>('.sticker') ?? [])
      const padding = 8

      stickers.forEach((sticker) => {
        // El contenedor es la ventana: la reacción rebota en los bordes de la pantalla.
        createDraggable(sticker, {
          container: bounds ?? undefined,
          containerPadding: padding,
          containerFriction: 0.9,
          releaseContainerFriction: 0.9,
          releaseStiffness: 32,
          releaseEase: 'out(3)',
          onGrab: () => animate(sticker, { scale: 1.16, ease: spring({ bounce: 0.5, duration: 320 }) }),
          onRelease: () => animate(sticker, { scale: 1, ease: spring({ bounce: 0.6, duration: 520 }) }),
        })
      })
    })

    return () => scope.revert()
  }, [reduced])

  if (reduced) return null

  return (
    <div
      ref={root}
      className="fixed bottom-5 right-5 z-50 hidden flex-col items-end gap-2 sm:flex"
      aria-label="Reacciones arrastrables"
    >
      <div className="sticker-bounds pointer-events-none fixed inset-0" aria-hidden="true" />
      <span className="mono border border-neon/30 bg-ink px-2 py-1 text-neon/80">ARRASTRA LAS REACCIONES ↘</span>
      <div className="flex items-center gap-2">
        {REACTIONS.map((reaction) => (
          <div key={reaction.src} className="sticker" title={reaction.label}>
            <img src={reaction.src} alt={reaction.label} draggable={false} />
          </div>
        ))}
      </div>
    </div>
  )
}
