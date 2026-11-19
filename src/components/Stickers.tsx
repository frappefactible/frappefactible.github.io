import { useEffect, useRef } from 'react'
import { animate, createDraggable, createScope, spring } from 'animejs'

interface Props {
  reduced: boolean
}

const REACTIONS = [
  { src: '/GIFs/Hello_in_languages.gif', label: '¿QUÉ CARAJOS?' },
  { src: '/GIFs/212747903-e9bdf048-2dc8-41f9-b973-0e72ff07bfba.gif', label: 'ME ENCANTA' },
  { src: '/GIFs/225813708-98b745f2-7d22-48cf-9150-083f1b00d6c9.gif', label: 'NO PUEDO MÁS' },
]

export function Stickers({ reduced }: Props) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !root.current) return

    const scope = createScope({ root: root.current })
    scope.add(() => {
      const stickers = Array.from(root.current?.querySelectorAll<HTMLElement>('.sticker') ?? [])
      stickers.forEach((sticker) => {
        createDraggable(sticker, {
          containerPadding: 8,
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
