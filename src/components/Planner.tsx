import { useMemo, useRef, useState } from 'react'
import { animate, spring } from 'animejs'
import { collectionById, getDisplayTitle, getYear } from '../data/catalog'
import type { MediaItem, PlannerEntry } from '../data/catalog'

interface Props {
  items: MediaItem[]
  planner: PlannerEntry[]
  onAdd: (id: number) => void
  onRemove: (id: number) => void
  onNote: (id: number, note: string) => void
  onMove: (from: number, to: number) => void
  onOpen: (item: MediaItem) => void
}

type CaptureFormat = 'post' | 'story' | 'square'
const formats: Array<{ value: CaptureFormat; label: string }> = [
  { value: 'post', label: 'ARCHIVO' },
  { value: 'story', label: '9:16' },
  { value: 'square', label: '1:1' },
]

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Carga una miniatura de forma segura para el canvas (sin contaminarlo). */
const loadThumb = async (src: string): Promise<HTMLImageElement | null> => {
  const loadImage = (url: string) =>
    new Promise<HTMLImageElement | null>((resolve) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      const timer = window.setTimeout(() => resolve(null), 12000)
      image.onload = () => {
        window.clearTimeout(timer)
        resolve(image)
      }
      image.onerror = () => {
        window.clearTimeout(timer)
        resolve(null)
      }
      image.src = url
    })

  try {
    const response = await fetch(src, { mode: 'cors' })
    if (response.ok) {
      const blobUrl = URL.createObjectURL(await response.blob())
      const image = await loadImage(blobUrl)
      URL.revokeObjectURL(blobUrl)
      if (image) return image
    }
  } catch {
    // Se prueba con la URL directa más abajo.
  }
  return loadImage(`${src}${src.includes('?') ? '&' : '?'}__cors=${Date.now()}`)
}

export function Planner({
  items,
  planner,
  onAdd,
  onRemove,
  onNote,
  onMove,
  onOpen,
}: Props) {
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [captureFormat, setCaptureFormat] = useState<CaptureFormat>('post')
  const dragIndex = useRef<number | null>(null)

  const chosen = useMemo(
    () =>
      planner
        .map((entry) => ({ entry, item: items.find((item) => item.id === entry.id) }))
        .filter((row): row is { entry: PlannerEntry; item: MediaItem } => Boolean(row.item)),
    [planner, items],
  )

  const results = useMemo(() => {
    const term = normalize(query.trim())
    if (!term) return []
    return items.filter((item) => normalize(item.title).includes(term)).slice(0, 6)
  }, [query, items])

  const fileName = `factible-plan-${new Date().toISOString().slice(0, 10)}.png`

  const makeCanvas = async (format: CaptureFormat): Promise<HTMLCanvasElement> => {
    await document.fonts.ready
    try {
      await document.fonts.load('78px Anton')
      await document.fonts.load('14px "DM Mono"')
    } catch {
      // Fuentes de respaldo del sistema.
    }

    const width = 1080
    const bottomPad = format === 'story' ? 150 : format === 'square' ? 120 : 130
    const height =
      format === 'post' ? 352 + chosen.length * 116 + bottomPad : format === 'story' ? 1920 : 1080
    const available = height - 352 - bottomPad
    const rowHeight = Math.max(48, Math.min(116, Math.floor(available / Math.max(chosen.length, 1))))
    const f = Math.min(1, rowHeight / 110)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas

    ctx.fillStyle = '#08080a'
    ctx.fillRect(0, 0, width, height)

    const glow = ctx.createRadialGradient(140, 90, 10, 140, 90, 700)
    glow.addColorStop(0, 'rgba(255,43,43,0.22)')
    glow.addColorStop(1, 'rgba(255,43,43,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(255,43,43,0.55)'
    ctx.lineWidth = 3
    ctx.strokeRect(12, 12, width - 24, height - 24)

    ctx.fillStyle = '#ff2b2b'
    ctx.fillRect(48, 48, 60, 60)
    ctx.fillStyle = '#08080a'
    ctx.font = '400 42px Anton, Impact, sans-serif'
    ctx.fillText('F', 66, 92)
    ctx.fillStyle = '#f4eee7'
    ctx.font = '400 30px Anton, Impact, sans-serif'
    ctx.fillText('FACTIBLE', 124, 84)
    ctx.fillStyle = '#8c8781'
    ctx.font = '500 13px "DM Mono", monospace'
    ctx.fillText('MI CARTELERA PERSONAL FAVORITA <3', 124, 105)

    ctx.fillStyle = '#f4eee7'
    ctx.font = '400 80px Anton, Impact, sans-serif'
    ctx.fillText('LO QUE AHORA', 48, 196)
    ctx.fillText('ESTOY VIENDO', 48, 278)

    ctx.fillStyle = '#ff2b2b'
    ctx.font = '500 14px "DM Mono", monospace'
    ctx.fillText(
      new Date()
        .toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
        .toUpperCase(),
      48,
      314,
    )

    ctx.strokeStyle = 'rgba(255,43,43,0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(48, 334)
    ctx.lineTo(width - 48, 334)
    ctx.stroke()

    const thumbs = await Promise.all(chosen.map((row) => loadThumb(row.item.imageUrl)))

    chosen.forEach(({ entry, item }, index) => {
      const y = 352 + index * rowHeight
      const collection = collectionById[item.collection]

      ctx.fillStyle = 'rgba(244,238,231,0.04)'
      ctx.fillRect(48, y, width - 96, rowHeight - 8)
      ctx.fillStyle = collection.color
      ctx.fillRect(48, y, 4, rowHeight - 8)

      const thumb = thumbs[index]
      const thumbW = Math.min(64, rowHeight * 0.62)
      if (thumb) {
        ctx.drawImage(thumb, 70, y + 4, thumbW, rowHeight - 16)
      } else {
        ctx.fillStyle = 'rgba(244,238,231,0.06)'
        ctx.fillRect(70, y + 4, thumbW, rowHeight - 16)
      }

      const left = 70 + thumbW + 18
      ctx.fillStyle = '#ff2b2b'
      ctx.font = '500 13px "DM Mono", monospace'
      ctx.fillText(String(index + 1).padStart(2, '0'), left, y + 18 * f + 6)

      ctx.fillStyle = '#f4eee7'
      ctx.font = `400 ${Math.round(32 * f)}px Anton, Impact, sans-serif`
      const title = getDisplayTitle(item)
      ctx.fillText(title.length > 46 ? `${title.slice(0, 44)}…` : title, left, y + 52 * f + 6)

      ctx.fillStyle = '#8c8781'
      ctx.font = `500 ${Math.round(12 * f)}px "DM Mono", monospace`
      ctx.fillText(
        `${item.type.toUpperCase()}  /  ${getYear(item)}`,
        left,
        y + 76 * f + 6,
      )

      if (entry.note.trim() && rowHeight > 78) {
        ctx.fillStyle = '#ff8a7a'
        ctx.font = `400 ${Math.round(13 * f)}px "DM Mono", monospace`
        ctx.fillText(`↳ ${entry.note.trim().slice(0, 60)}`, left, y + 98 * f + 6)
      }
    })

    const footerY = height - 48
    ctx.fillStyle = '#8c8781'
    ctx.font = '500 13px "DM Mono", monospace'
    ctx.fillText(`${chosen.length} TÍTULOS`, 48, footerY)
    ctx.fillStyle = '#ff2b2b'
    ctx.fillText('frappefactible.github.io', width - 264, footerY)

    return canvas
  }

  const getBlob = async (format: CaptureFormat): Promise<Blob | null> => {
    const canvas = await makeCanvas(format)
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  }

  const saveBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  const download = async () => {
    if (!chosen.length) return
    setBusy(true)
    try {
      const blob = await getBlob(captureFormat)
      if (blob) saveBlob(blob)
    } finally {
      setBusy(false)
    }
  }

  const share = async () => {
    if (!chosen.length) return
    setBusy(true)
    try {
      const blob = await getBlob(captureFormat)
      if (!blob) return
      const file = new File([blob], fileName, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Mi cartelera personal',
            text: 'Mi cartelera personal favorita <3',
          })
          return
        } catch {
          // El usuario canceló: se descarga igual.
        }
      }
      saveBlob(blob)
    } finally {
      setBusy(false)
    }
  }

  const copyList = async () => {
    const text = [
      'MI CARTELERA PERSONAL FAVORITA <3',
      ...chosen.map(
        ({ entry, item }, index) =>
          `${index + 1}. ${getDisplayTitle(item)}${entry.note.trim() ? ` — ${entry.note.trim()}` : ''}`,
      ),
      'frappefactible.github.io',
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
  }

  const drop = (target: number) => {
    const source = dragIndex.current
    dragIndex.current = null
    if (source !== null && source !== target) onMove(source, target)
  }

  return (
    <section id="plan" className="border-y border-white/10 bg-ink-2/40 px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mono text-neon">GUARDADO EN TU NAVEGADOR</div>
            <h2 className="display mt-2 text-4xl md:text-6xl">MI PLAN DE VISIONADO</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Lo que ahora estoy viendo. Arma tu lista, vuelve cuando quieras y descárgala
            como imagen para compartirla.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0 border border-white/10 bg-ink p-5">
            <div className="mono text-muted">AÑADIR UN TÍTULO</div>
            <label className="mt-3 flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-3 focus-within:border-neon">
              <span className="mono text-neon">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="BUSCA POR TÍTULO…"
                aria-label="Buscar título para añadir al plan"
                className="w-full min-w-0 bg-transparent mono text-bone placeholder:text-muted/70 focus:outline-none"
              />
            </label>

            {query.trim() ? (
              <div className="mt-3 space-y-px">
                {results.length === 0 ? (
                  <p className="mono py-4 text-muted">SIN RESULTADOS</p>
                ) : (
                  results.map((item) => {
                    const already = planner.some((entry) => entry.id === item.id)
                    return (
                      <div key={item.id} className="flex items-center gap-3 bg-white/[0.03] p-2">
                        <img src={item.imageUrl} alt="" className="h-14 w-10 shrink-0 object-cover" loading="lazy" />
                        <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm text-bone">{getDisplayTitle(item)}</span>
                          <span className="mono text-muted">{item.type} · {getYear(item)}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdd(item.id)}
                          disabled={already}
                          aria-label={`Añadir ${getDisplayTitle(item)} al plan`}
                          className="grid h-9 w-9 shrink-0 place-items-center border border-neon text-neon transition-colors hover:bg-neon hover:text-ink disabled:cursor-default disabled:border-white/15 disabled:text-muted/50 disabled:hover:bg-transparent"
                        >
                          {already ? '✓' : '+'}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <p className="mono mt-4 leading-relaxed text-muted">
                Escribe un nombre y aparecerán coincidencias del archivo. También puedes
                añadir desde la ficha de cada título.
              </p>
            )}
          </div>

          <div className="min-w-0 border border-white/10 bg-ink p-5">
            <div className="flex items-center justify-between">
              <div className="mono text-muted">LO QUE AHORA ESTOY VIENDO</div>
              <div className="mono text-neon">{String(chosen.length).padStart(2, '0')}</div>
            </div>

            {chosen.length === 0 ? (
              <div className="mt-8 border border-dashed border-white/15 py-14 text-center">
                <div className="display text-3xl text-muted">SALA VACÍA</div>
                <p className="mt-2 text-xs text-muted">Busca un título y añádelo a tu plan.</p>
              </div>
            ) : (
              <ol className="mt-3 space-y-2">
                {chosen.map(({ entry, item }, index) => {
                  const collection = collectionById[item.collection]
                  return (
                    <li
                      key={entry.id}
                      draggable
                      onDragStart={(event) => {
                        dragIndex.current = index
                        animate(event.currentTarget, {
                          scale: 0.97,
                          ease: spring({ bounce: 0.4, duration: 300 }),
                        })
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => drop(index)}
                      onDragEnd={(event) => {
                        dragIndex.current = null
                        animate(event.currentTarget, {
                          scale: 1,
                          ease: spring({ bounce: 0.5, duration: 400 }),
                        })
                      }}
                      className="flex cursor-grab items-center gap-3 border-l-2 bg-white/[0.03] p-2 active:cursor-grabbing"
                      style={{ borderColor: collection.color }}
                    >
                      <span className="mono w-6 shrink-0 text-neon">{String(index + 1).padStart(2, '0')}</span>
                      <img src={item.imageUrl} alt="" className="h-16 w-11 shrink-0 object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <button type="button" onClick={() => onOpen(item)} className="block w-full truncate text-left font-display text-lg uppercase leading-none text-bone">
                          {getDisplayTitle(item)}
                        </button>
                        <span className="mono mt-1 block truncate text-muted">
                          {item.type} · {getYear(item)}
                        </span>
                        <input
                          value={entry.note}
                          onChange={(event) => onNote(entry.id, event.target.value)}
                          placeholder="nota (capítulo, día…)"
                          aria-label={`Nota para ${getDisplayTitle(item)}`}
                          className="mt-1 w-full border-b border-white/10 bg-transparent pb-0.5 mono text-xs text-bone placeholder:text-muted/60 focus:border-neon focus:outline-none"
                        />
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => onMove(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          aria-label="Subir en la lista"
                          className="grid h-6 w-8 place-items-center border border-white/15 text-xs text-muted hover:border-neon hover:text-neon disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => onMove(index, Math.min(chosen.length - 1, index + 1))}
                          disabled={index === chosen.length - 1}
                          aria-label="Bajar en la lista"
                          className="grid h-6 w-8 place-items-center border border-white/15 text-xs text-muted hover:border-neon hover:text-neon disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(entry.id)}
                        aria-label={`Quitar ${getDisplayTitle(item)} del plan`}
                        className="grid h-9 w-9 shrink-0 place-items-center border border-white/15 text-muted transition-colors hover:border-neon hover:text-neon"
                      >
                        ×
                      </button>
                    </li>
                  )
                })}
              </ol>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mono mr-1 text-muted">CAPTURA</span>
              {formats.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCaptureFormat(option.value)}
                  aria-pressed={captureFormat === option.value}
                  className={`border px-2 py-1.5 mono ${
                    captureFormat === option.value
                      ? 'border-neon bg-neon/15 text-neon'
                      : 'border-white/15 text-muted hover:text-bone'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={download}
                disabled={!chosen.length || busy}
                className="neon-glow bg-neon px-5 py-3 mono text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? 'GENERANDO…' : '↓ DESCARGAR CAPTURA'}
              </button>
              <button
                type="button"
                onClick={share}
                disabled={!chosen.length || busy}
                className="border border-neon/60 px-5 py-3 mono text-neon transition-colors hover:bg-neon/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↗ COMPARTIR
              </button>
              <button
                type="button"
                onClick={copyList}
                disabled={!chosen.length}
                className="border border-white/25 px-5 py-3 mono text-muted transition-colors hover:border-bone hover:text-bone disabled:opacity-40"
              >
                ⧉ COPIAR TEXTO
              </button>
              {chosen.length > 0 && (
                <button
                  type="button"
                  onClick={() => [...chosen].forEach((row) => onRemove(row.entry.id))}
                  className="border border-white/25 px-5 py-3 mono text-muted transition-colors hover:border-neon hover:text-neon"
                >
                  VACIAR LISTA
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
