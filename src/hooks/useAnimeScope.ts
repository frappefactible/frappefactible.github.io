import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { createScope } from 'animejs'

type Scope = ReturnType<typeof createScope>

/**
 * Scope de Anime.js v4 ligado al ciclo de vida del componente.
 * `run()` revienta el scope anterior y registra las animaciones nuevas
 * para que `revert()` limpie todo al desmontar.
 */
export function useAnimeScope(rootRef: RefObject<HTMLElement | null>) {
  const scopeRef = useRef<Scope | null>(null)

  useEffect(() => () => scopeRef.current?.revert(), [])

  const run = useCallback(
    (constructor: () => void) => {
      scopeRef.current?.revert()
      const scope = createScope({ root: rootRef.current ?? undefined })
      scope.add(constructor)
      scopeRef.current = scope
    },
    [rootRef],
  )

  return run
}
