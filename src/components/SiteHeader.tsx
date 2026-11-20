interface Props {
  total: number
  favorites: number
  seen: number
}

export function SiteHeader({ total, favorites, seen }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-5 md:px-10">
        <a href="#top" className="group flex items-center gap-3" aria-label="Ir al inicio">
          <span className="grid h-9 w-9 place-items-center bg-neon font-display text-xl leading-none text-ink transition-transform duration-300 group-hover:-rotate-6">
            F
          </span>
          <span className="display text-xl tracking-wide">FACTIBLE</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          <a href="#cartelera" className="mono text-muted transition-colors hover:text-neon">Cartelera</a>
          <a href="#colecciones" className="mono text-muted transition-colors hover:text-neon">Colecciones</a>
          <a href="#plan" className="mono text-muted transition-colors hover:text-neon">Mi plan</a>
          <a href="#stats" className="mono text-muted transition-colors hover:text-neon">Stats</a>
        </nav>

        <div className="flex items-center gap-4 mono text-muted">
          <span className="hidden sm:inline"><b className="text-bone">{total}</b> TÍTULOS</span>
          <span className="hidden sm:inline"><b className="text-bone">{seen}</b> VISTOS</span>
          <span className="text-neon">♥ {favorites}</span>
        </div>
      </div>
    </header>
  )
}
