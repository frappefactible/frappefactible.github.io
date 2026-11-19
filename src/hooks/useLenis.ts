import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

/** Scroll suave sincronizado con ScrollTrigger. Se desactiva con reduced-motion. */
export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.4,
    })

    const update = () => ScrollTrigger.update()
    lenis.on('scroll', update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.off('scroll', update)
      lenis.destroy()
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [enabled])
}
