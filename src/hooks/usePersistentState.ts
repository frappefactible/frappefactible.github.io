import { useCallback, useEffect, useState } from 'react'

/** Estado sincronizado con localStorage. Funciona también si el storage está bloqueado. */
export function usePersistentState<T>(
  key: string,
  initial: T,
  revive?: (raw: unknown) => T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return initial
      const parsed: unknown = JSON.parse(raw)
      return revive ? revive(parsed) : (parsed as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Modo privado o cuota agotada: el estado sigue vivo en memoria.
    }
  }, [key, value])

  const reset = useCallback(() => setValue(initial), [initial])

  return [value, setValue, reset] as const
}
