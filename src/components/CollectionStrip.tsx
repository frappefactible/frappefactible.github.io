import { collections } from '../data/catalog'
import type { CollectionId } from '../data/catalog'

interface Props {
  active: CollectionId | null
  counts: Record<CollectionId, number>
  onSelect: (id: CollectionId | null) => void
  onBeforeChange: () => void
}

export function CollectionStrip({ active, counts, onSelect, onBeforeChange }: Props) {
  const select = (id: CollectionId | null) => {
    onBeforeChange()
    onSelect(active === id ? null : id)
  }

  return (
    <section id="colecciones" className="border-y border-white/10 bg-ink-2/50 py-10">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mono text-neon">NUEVA CLASIFICACIÓN</div>
            <h2 className="display mt-2 text-4xl md:text-5xl">OBSESIONES TEMÁTICAS</h2>
          </div>
          <p className="hidden max-w-xs text-right text-xs leading-relaxed text-muted md:block">
            Se acabaron las fases. Aquí una película, una serie y un anime pueden compartir
            el mismo infierno.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4 lg:grid-cols-8">
          {collections.map((collection) => {
            const isActive = active === collection.id
            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => select(collection.id)}
                aria-pressed={isActive}
                className={`group flex min-h-[136px] flex-col justify-between bg-ink p-4 text-left transition-colors duration-300 ${
                  isActive ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                }`}
                style={isActive ? { boxShadow: `inset 0 3px 0 ${collection.color}` } : undefined}
              >
                <span className="text-2xl" style={{ color: collection.color }}>
                  {collection.glyph}
                </span>
                <span>
                  <span className="display block text-lg leading-tight text-bone transition-colors group-hover:text-white">
                    {collection.name}
                  </span>
                  <span className="mono mt-2 block text-muted">{String(counts[collection.id]).padStart(2, '0')}</span>
                </span>
                <span
                  className="h-px w-0 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: collection.color }}
                />
              </button>
            )
          })}
        </div>

        {active && (
          <button
            type="button"
            onClick={() => select(active)}
            className="mono mt-4 text-muted underline decoration-neon underline-offset-4 hover:text-neon"
          >
            × QUITAR FILTRO DE COLECCIÓN
          </button>
        )}
      </div>
    </section>
  )
}
