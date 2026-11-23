import { useEffect, useRef } from 'react'
import { animate, createDraggable, createScope, spring } from 'animejs'
import type { Draggable } from 'animejs'

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
  const items = useRef<Array<{ el: HTMLElement; draggable: Draggable }>>([])

  useEffect(() => {
    if (reduced || !root.current) return

    const bounds = root.current.querySelector<HTMLElement>('.sticker-bounds')
    const scope = createScope({ root: root.current })
    const lastPulse = new WeakMap<HTMLElement, number>()

    /** Empuja una reacción dentro de los límites y le da un pequeño rebote. */
    const push = (draggable: Draggable, dx: number, dy: number, el: HTMLElement) => {
      const [top, right, bottom, left] = draggable.containerBounds
      const nextX = Math.min(Math.max(draggable.x + dx, left), right)
      const nextY = Math.min(Math.max(draggable.y + dy, top), bottom)
      if (nextX === draggable.x && nextY === draggable.y) return

      draggable.setX(nextX, true)
      draggable.setY(nextY, true)

      const now = performance.now()
      if (now - (lastPulse.get(el) ?? 0) > 450) {
        lastPulse.set(el, now)
        animate(el, { scale: [1, 1.12, 1], ease: spring({ bounce: 0.6, duration: 420 }) })
      }
    }

    /** Separa las reacciones que se solapan para que nunca queden apiladas. */
    const resolveCollisions = () => {
      const list = items.current
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i].el.getBoundingClientRect()
          const b = list[j].el.getBoundingClientRect()
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (overlapX <= 0 || overlapY <= 0) continue

          const separateByX = overlapX < overlapY
          const impulse = (separateByX ? overlapX : overlapY) + 6
          const sign =
            (separateByX
              ? b.left + b.right < a.left + a.right
              : b.top + b.bottom < a.top + a.bottom)
              ? -1
              : 1

          const dx = separateByX ? sign * impulse : 0
          const dy = separateByX ? 0 : sign * impulse
          push(list[j].draggable, dx, dy, list[j].el)
          push(list[i].draggable, -dx * 0.3, -dy * 0.3, list[i].el)
        }
      }
    }

    scope.add(() => {
      items.current = []
      const stickers = Array.from(root.current?.querySelectorAll<HTMLElement>('.sticker') ?? [])
      stickers.forEach((sticker) => {
        const draggable = createDraggable(sticker, {
          container: bounds ?? undefined,
          containerPadding: 8,
          containerFriction: 0.9,
          releaseContainerFriction: 0.9,
          releaseStiffness: 32,
          releaseEase: 'out(3)',
          onGrab: () => animate(sticker, { scale: 1.16, ease: spring({ bounce: 0.5, duration: 320 }) }),
          onDrag: resolveCollisions,
          onRelease: () => animate(sticker, { scale: 1, ease: spring({ bounce: 0.6, duration: 520 }) }),
        })
        items.current.push({ el: sticker, draggable })
      })
    })

    return () => {
      scope.revert()
      items.current = []
    }
  }, [reduced])

  if (reduced) return null

  return (
    <div
      ref={root}
      className="pointer-events-none fixed bottom-5 right-5 z-50 hidden flex-col items-end gap-2 sm:flex"
      aria-label="ARRASTRA LAS REACCIONES ↘"
    >
      <div className="sticker-bounds pointer-events-none fixed inset-0" aria-hidden="true" />
      <span className="mono border border-neon/30 bg-ink px-2 py-1 text-neon">ARRASTRA LAS REACCIONES ↘</span>
      <div className="flex items-center gap-2">
        {REACTIONS.map((reaction) => (
          <div key={reaction.src} className="sticker pointer-events-auto" title={reaction.label}>
            <img src={reaction.src} alt={reaction.label} draggable={false} />
          </div>
        ))}
      </div>
    </div>
  )
}
