import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { Flip, gsap, useGSAP } from '../lib/gsap'
import { MediaCard } from './MediaCard'
import type { MediaItem } from '../data/catalog'

interface Props {
  items: MediaItem[]
  visibleIds: Set<number>
  flipState: RefObject<ReturnType<typeof Flip.getState> | null>
  favorites: number[]
  onOpen: (item: MediaItem) => void
  onToggleFavorite: (id: number) => void
  reduced: boolean
}

export function MediaGrid({
  items,
  visibleIds,
  flipState,
  favorites,
  onOpen,
  onToggleFavorite,
  reduced,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const visibleKey = useMemo(() => [...visibleIds].join(','), [visibleIds])

  useGSAP(
    () => {
      if (reduced) return
      gsap.from('.media-card', {
        autoAlpha: 0,
        y: 36,
        scale: 0.95,
        duration: 0.65,
        stagger: { each: 0.012, from: 'start' },
        ease: 'expo.out',
      })
    },
    { scope: gridRef },
  )

  useGSAP(
    () => {
      const state = flipState.current
      flipState.current = null
      if (!state || reduced) return

      Flip.from(state, {
        duration: 0.65,
        ease: 'power3.inOut',
        absoluteOnLeave: true,
        scale: true,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { autoAlpha: 0, scale: 0.82 },
            { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.5)' },
          ),
        onLeave: (elements) =>
          gsap.to(elements, { autoAlpha: 0, scale: 0.82, duration: 0.25 }),
      })
    },
    { scope: gridRef, dependencies: [visibleKey] },
  )

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          visible={visibleIds.has(item.id)}
          favorite={favorites.includes(item.id)}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
