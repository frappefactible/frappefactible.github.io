import { useMemo, useState } from 'react'
import { collectionById, getDisplayTitle, getYear } from '../data/catalog'
import type { MediaItem } from '../data/catalog'

interface Props {
  items: MediaItem[]
  plannerIds: number[]
  onAdd: (id: number) => void
  onRemove: (id: number) => void
  onOpen: (item: MediaItem) => void
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Carga una miniatura con CORS; si el servidor no lo permite, devuelve null. */
const loadThumb = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    const timer = window.setTimeout(() => resolve(null), 4000)
    image.onload = () => {
      window.clearTimeout(timer)
      resolve(image)
    }
    image.onerror = () => {
      window.clearTimeout(timer)
      resolve(null)
    }
    image.src = src
  })

export function Planner({ items, plannerIds, onAdd, onRemove, onOpen }: Props) {
  const [query, setQuery] = useState('')
  const [exporting, setExporting] = useState(false)

  const chosen = useMemo(
    () =>
      plannerIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is MediaItem => Boolean(item)),
    [plannerIds, items],
  )

  const results = useMemo(() => {
    const term = normalize(query.trim())
    if (!term) return []
    return items.filter((item) => normalize(item.title).includes(term)).slice(0, 6)
  }, [query, items])

  const exportCapture = async () => {
    if (chosen.length === 0) return
    setExporting(true)
    try {
      await document.fonts.ready
      try {
        await document.fonts.load('78px Anton')
        await document.fonts.load('14px "DM Mono"')
      } catch {
        // Se usan las fuentes de respaldo del sistema.
      }

      const width = 1080
      const rowHeight = 116
      const height = 380 + chosen.length * rowHeight + 130
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

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

      // Cabecera
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
      ctx.fillText('CARTELERA NOCTURNA / PLAN PERSONAL', 124, 105)

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

      const thumbs = await Promise.all(chosen.map((item) => loadThumb(item.imageUrl)))

      chosen.forEach((item, index) => {
        const y = 352 + index * rowHeight
        const collection = collectionById[item.collection]

        ctx.fillStyle = 'rgba(244,238,231,0.04)'
        ctx.fillRect(48, y, width - 96, rowHeight - 12)
        ctx.fillStyle = collection.color
        ctx.fillRect(48, y, 4, rowHeight - 12)

        const thumb = thumbs[index]
        if (thumb) {
          try {
            ctx.drawImage(thumb, 70, y + 8, 64, rowHeight - 28)
          } catch {
            // Imagen no dibujable: se usa el bloque de color de abajo.
          }
        }
        if (!thumb) {
          ctx.fillStyle = `${collection.color}33`
          ctx.fillRect(70, y + 8, 64, rowHeight - 28)
          ctx.fillStyle = collection.color
          ctx.font = '400 32px sans-serif'
          ctx.fillText(collection.glyph, 86, y + 58)
        }

        ctx.fillStyle = '#ff2b2b'
        ctx.font = '500 13px "DM Mono", monospace'
        ctx.fillText(String(index + 1).padStart(2, '0'), 152, y + 30)

        ctx.fillStyle = '#f4eee7'
        ctx.font = '400 32px Anton, Impact, sans-serif'
        const title = getDisplayTitle(item)
        ctx.fillText(title.length > 44 ? `${title.slice(0, 42)}…` : title, 152, y + 62)

        ctx.fillStyle = '#8c8781'
        ctx.font = '500 12px "DM Mono", monospace'
        ctx.fillText(
          `${item.type.toUpperCase()}  /  ${getYear(item)}  /  ${collection.name.toUpperCase()}`,
          152,
          y + 86,
        )
      })

      const footerY = 380 + chosen.length * rowHeight + 42
      ctx.fillStyle = '#8c8781'
      ctx.font = '500 13px "DM Mono", monospace'
      ctx.fillText(`${chosen.length} TÍTULOS  ·  GUARDADO EN TU NAVEGADOR`, 48, footerY)
      ctx.fillStyle = '#ff2b2b'
      ctx.fillText('factible.github.io', width - 232, footerY)

      const link = document.createElement('a')
      link.download = `factible-plan-${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(false)
    }
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
          {/* Buscador para añadir */}
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
                    const already = plannerIds.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-white/[0.03] p-2"
                      >
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-14 w-10 shrink-0 object-cover"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => onOpen(item)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span className="block truncate text-sm text-bone">
                            {getDisplayTitle(item)}
                          </span>
                          <span className="mono text-muted">
                            {item.type} · {getYear(item)}
                          </span>
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

          {/* Lista actual */}
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
                {chosen.map((item, index) => {
                  const collection = collectionById[item.collection]
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 border-l-2 bg-white/[0.03] p-2"
                      style={{ borderColor: collection.color }}
                    >
                      <span className="mono w-6 shrink-0 text-neon">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-16 w-11 shrink-0 object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => onOpen(item)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate font-display text-lg uppercase leading-none text-bone">
                          {getDisplayTitle(item)}
                        </span>
                        <span className="mono mt-1 block truncate text-muted">
                          {collection.glyph} {collection.name} · {item.type}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
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

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportCapture}
                disabled={chosen.length === 0 || exporting}
                className="neon-glow bg-neon px-5 py-3 mono text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {exporting ? 'GENERANDO…' : '↓ DESCARGAR CAPTURA'}
              </button>
              {chosen.length > 0 && (
                <button
                  type="button"
                  onClick={() => [...chosen].forEach((item) => onRemove(item.id))}
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
