import { useRef, useState } from 'react'
import type { MediaItem, PlannerEntry, SortMode } from '../data/catalog'

export interface BackupData {
  version: 1
  exportedAt: string
  favorites: number[]
  planner: PlannerEntry[]
  overrides: Record<number, Partial<Pick<MediaItem, 'status' | 'note'>>>
  sort: SortMode
  history: number[]
}

interface Props {
  data: Omit<BackupData, 'version' | 'exportedAt'>
  onImport: (data: Omit<BackupData, 'version' | 'exportedAt'>) => void
  onReset: () => void
}

export function DataBackup({ data, onImport, onReset }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  const exportData = () => {
    const payload: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      ...data,
    }
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `factible-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Respaldo descargado.')
  }

  const importData = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as Partial<BackupData>
      if (parsed.version !== 1) throw new Error('Versión no compatible')
      if (!window.confirm('¿Reemplazar tus datos locales con los del archivo?')) return
      onImport({
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        planner: Array.isArray(parsed.planner) ? parsed.planner : [],
        overrides: parsed.overrides ?? {},
        sort: parsed.sort ?? 'archivo',
        history: Array.isArray(parsed.history) ? parsed.history : [],
      })
      setMessage('Datos restaurados.')
    } catch {
      setMessage('No se pudo leer el archivo.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const reset = () => {
    if (!window.confirm('¿Borrar favoritos, notas, estados y tu plan? No se puede deshacer.')) return
    onReset()
    setMessage('Datos reiniciados.')
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 mono text-muted">
      <button type="button" onClick={exportData} className="hover:text-neon">↓ EXPORTAR MIS DATOS</button>
      <button type="button" onClick={() => fileRef.current?.click()} className="hover:text-neon">↑ IMPORTAR</button>
      <button type="button" onClick={reset} className="hover:text-neon">REINICIAR</button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => importData(event.target.files?.[0])}
      />
      {message && <span className="text-neon/80">{message}</span>}
    </div>
  )
}
