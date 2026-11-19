import { useEffect, useRef } from 'react'
import { animate, spring } from 'animejs'
import { gsap, SplitText, useGSAP } from '../lib/gsap'
import { useAnimeScope } from '../hooks/useAnimeScope'

interface Props {
  onDone: () => void
  reduced: boolean
}

export function Preloader({ onDone, reduced }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const logo = useRef<HTMLImageElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const runAnime = useAnimeScope(root)
  const finished = useRef(false)

  const finish = () => {
    if (!finished.current) {
      finished.current = true
      onDone()
    }
  }

  useEffect(() => {
    if (!reduced) return
    const timer = window.setTimeout(finish, 120)
    return () => window.clearTimeout(timer)
  }, [reduced])

  useGSAP(
    () => {
      if (reduced || !title.current) return
      const split = SplitText.create(title.current, { type: 'chars', mask: 'chars' })
      const tl = gsap.timeline({ onComplete: finish })
      tl.from(split.chars, {
        yPercent: 120,
        rotate: 9,
        autoAlpha: 0,
        duration: 0.75,
        ease: 'expo.out',
        stagger: 0.035,
      })
        .from(
          bar.current,
          { scaleX: 0, transformOrigin: 'left center', duration: 1.05, ease: 'power2.inOut' },
          0.08,
        )
        .to(root.current, { autoAlpha: 0, duration: 0.45, ease: 'power2.inOut' }, '+=0.12')

      return () => split.revert()
    },
    { scope: root },
  )

  useEffect(() => {
    if (reduced) return
    runAnime(() => {
      if (logo.current) {
        animate(logo.current, {
          scale: [0.35, 1],
          rotate: [-16, 0],
          opacity: [0, 1],
          ease: spring({ bounce: 0.55, duration: 620 }),
          delay: 60,
        })
      }
      if (bar.current) {
        animate(bar.current, {
          boxShadow: [
            '0 0 0 rgba(255,43,43,0)',
            '0 0 22px rgba(255,43,43,0.9)',
            '0 0 0 rgba(255,43,43,0)',
          ],
          duration: 700,
          ease: 'out(2)',
        })
      }
    })
  }, [reduced, runAnime])

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      aria-label="Cargando cartelera"
      role="status"
    >
      <div className="absolute left-6 top-6 mono text-muted">FACTIBLE / SISTEMA DE ARCHIVO</div>
      <div className="absolute right-6 top-6 mono text-muted">v.2026</div>

      <img
        ref={logo}
        src="/logos/factible_logo1.png"
        alt="Logo de FACTIBLE"
        className="mb-6 h-20 w-auto opacity-0 md:h-28"
      />

      <h1 ref={title} className="display text-center text-[clamp(3.5rem,14vw,11rem)] text-bone">
        FACTIBLE
      </h1>

      <div className="mt-4 mono text-neon">CARTELERA NOCTURNA — PREPARANDO FUNCIONES</div>

      <div className="mt-10 h-px w-[min(70vw,420px)] bg-white/15">
        <div ref={bar} className="h-px w-full origin-left bg-neon" />
      </div>

      <div className="absolute bottom-6 mono text-muted">93 TÍTULOS · 8 OBSESIONES</div>
    </div>
  )
}
