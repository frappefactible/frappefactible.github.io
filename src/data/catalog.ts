/**
 * Catálogo completo de FACTIBLE — migrado 100% desde `script.js`.
 * Los tipos se conservan tal cual estaban en el original. Las antiguas "fases"
 * se sustituyen por colecciones temáticas que cruzan películas, series y animes.
 */

export type MediaType =
  | 'Película'
  | 'Anime'
  | 'Película Anime'
  | 'OVA'
  | 'Serie'
  | 'Manga'

export type MediaStatus = 'Por ver' | 'Visto'

export type SortMode = 'archivo' | 'anio' | 'titulo' | 'estado' | 'favoritos'

export type CollectionId =
  | 'accion'
  | 'crimen'
  | 'cyberpunk'
  | 'guerra'
  | 'desolacion'
  | 'demonios'
  | 'mente'
  | 'espiritu'

export interface Collection {
  id: CollectionId
  name: string
  tagline: string
  color: string
  glyph: string
}

export interface PlannerEntry {
  id: number
  note: string
}

export interface MediaItem {
  id: number
  /** Título original completo, con el título en su idioma entre corchetes y el año. */
  title: string
  type: MediaType
  collection: CollectionId
  imageUrl: string
  /** Reseña breve de FACTIBLE; editable desde la ficha y guardada en localStorage. */
  note: string
  status: MediaStatus
}

export const collections: Collection[] = [
  { id: 'accion',     name: 'Acción & Adrenalina', tagline: 'Pulso alto, frenos rotos',        color: '#FF3B30', glyph: '✦' },
  { id: 'crimen',     name: 'Cine Negro & Crimen', tagline: 'No hay reglas, hay códigos',     color: '#FF6B35', glyph: '◆' },
  { id: 'cyberpunk',  name: 'Neón & Cyberpunk',    tagline: 'El futuro ya se derramó',        color: '#FF2D78', glyph: '⌁' },
  { id: 'guerra',     name: 'Guerra & Cicatrices', tagline: 'Nadie sale limpio',              color: '#C92A2A', glyph: '✕' },
  { id: 'desolacion', name: 'Desolación',          tagline: 'Después del final',              color: '#FF4D4D', glyph: '◌' },
  { id: 'demonios',   name: 'Demonios & Sangre',   tagline: 'Infiernos con buena banda sonora',color: '#E01E37', glyph: '⛧' },
  { id: 'mente',      name: 'Mente & Realidad',    tagline: 'La cabeza también sangra',       color: '#FF3D9A', glyph: '◈' },
  { id: 'espiritu',   name: 'Espíritu & Comedia',  tagline: 'Respira, que también se vive',    color: '#FF8A5B', glyph: '❋' },
]

export const collectionById = Object.fromEntries(
  collections.map((c) => [c.id, c]),
) as Record<CollectionId, Collection>

type CatalogRow = [
  id: number,
  title: string,
  type: MediaType,
  collection: CollectionId,
  imageUrl: string,
  note: string,
]

const rows: CatalogRow[] = [
  [1, "[The Peacemaker] El Pacificador (1997)", "Película", "accion", "https://image.tmdb.org/t/p/original/qto8oLbJRSkPXoZzsoKIU6s2FN2.jpg", "Cañones y silencio: el thriller setentero que abre la cartelera con pulso de francotirador."], // Por ver
  [2, "[Commando] Commando (1985)", "Película", "accion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/cA6a4xW76bNZdXZKLCr4YkdpElK.jpg", "Acción ochentera sin frenos ni disculpas. Schwarzenegger en modo demolición."], // Por ver
  [3, "[Red Heat] Red Heat (1988)", "Película", "accion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/zryS52ge0fk7NMt1koH9YcMaooA.jpg", "Rusos, fuego y una ciudad de acero. Acción con acento internacional."], // Por ver
  [4, "[ライディング・ビーン] Riding Bean (1989)", "OVA", "accion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/bZyuxz1dosJpmdmHhs9KdTEzrQx.jpg", "Un encargo, un chaleco y un ritmo que no baja. OVA de culto para empezar."], // Por ver
  [5, "[ガンスミスキャッツ] Gunsmith Cats (1995)", "OVA", "accion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/nl0JH0b5JfJDaN1KuS0YbSfOxPX.jpg", "Dos cazadoras, coches y plomo. Violencia elegante en versión animada."], // Por ver
  [6, "[Demolition Man] Demolition Man (1993)", "Película", "accion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4ibsnd6k5ZIvxPZAUWcKKwCgnab.jpg", "Futuro sudoroso, criónica y un Detroit que no perdona. Setenta puros."], // Por ver
  [7, "[Total Recall] Total Recall (1990)", "Película", "mente", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/v7DoneFNYIrCGeNFiPrqGiQlimN.jpg", "¿Recuerdos reales o implantados? Verhoeven te lo pregunta a ti también."], // Por ver
  [8, "[Léon] Léon: The Professional (1994)", "Película", "crimen", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/eWf4KEaCpiWcDOBkTiNQ0328k3H.jpg", "Un asesino, una niña y un tango. La ternura también sabe a bala."], // Por ver
  [9, "[John Wick] John Wick (2014)", "Película", "crimen", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tDl5ac1VJwMRvlgINDCsDCqg9CE.jpg", "Venganza con traje y reglas. John Wick es ballet con munición."], // Visto
  [10, "[DRIVE] Drive (2011)", "Película", "crimen", "https://image.tmdb.org/t/p/original/sRUAPNGYOF7OkNbvWbYDMQagkXt.jpg", "Neón, casco y conducción nocturna. Una película que hace del silencio un personaje."], // Por ver
  [11, "[カウボーイビバップ] Cowboy Bebop (1998)", "Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/xDiXDfZwC6XYC6fxHI1jl3A3Ill.jpg", "Bebop, jazz y cazarrecompensas en un espacio que huele a café frío."], // Por ver
  [12, "[Blade Runner] Blade Runner (1982)", "Película", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/pBA2J6iQMiP5Zd4ewMKdOWfq1HV.jpg", "Lluvia, luces y un replicante. El mejor debut visual del cyberpunk."], // Visto
  [13, "[AKIRA] Akira (1988)", "Película Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/vjPt8HYymLOkRv82x9JwVO7M2a5.jpg", "Kaneda contra el sistema. Su moto sigue siendo el mejor grito de los ochenta."], // Por ver
  [14, "[バブルガムクライシス] Bubblegum Crisis (1987)", "OVA", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/rnF1zD3GP3L4DDoLIshUEH0JYHJ.jpg", "Trajes de poder y una ciudad que se derrumba. Cyberpunk con esteroides ochenteros."], // Por ver
  [15, "[アミテージ・ザ・サード] Armitage III (1995)", "OVA", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tUSuhszUrM6ffR1MRBphnpRtsyX.jpg", "Robots, memoria y asesinatos en la noche. OVA de culto infravalorado."], // Por ver
  [16, "[サイバーパンク: エッジランナーズ] Cyberpunk: Edgerunners (2022)", "Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/lqcDVZ8pyk08AVftMBildDR3QUK.jpg", "Neón, cromo y una caída inevitable. El anime cyberpunk más brutal de los recientes."], // Por ver
  [17, "[Mars Express] Mars Express (2023)", "Película", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/aEC0dFieUjpkveilI9GQdTfUFc9.jpg", "Marte, una IA y un cuerpo prestado. Ciencia ficción con prisa y corazón."], // Por ver
  [18, "[PSYCHO-PASS サイコパス] Psycho-Pass (2012)", "Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/xHFMsGXdjXJDXMQvHhh7owu7TGr.jpg", "Un sistema que te juzga antes de que pienses. Distopía policial impecable."], // Por ver
  [19, "[Minority Report] Minority Report (2002)", "Anime", "mente", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/pnzJEfXpRc1bknR5ASFG0MZcTvo.jpg", "Precrimen y libre albedrío. Spielberg filmando nuestra ansiedad futura."], // Por ver
  [20, "[GANGSTA.] GANGSTA. (2015)", "Película Anime", "crimen", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ly43ajQpjpYYnx3w5BgFtcflUTD.jpg", "Pandilleros, música y ciudad podrida. Anime con sabor a serie negra."], // Por ver
  [21, "[Serbian Scars] Cicatrices Serbias (2009)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/igsaXntB4xW6M5w1wAChwn6DggD.jpg", "Balcanes, humor negro y minas. La guerra contada con risa incómoda."], // Por ver
  [22, "[Технотајз: Едит и ја] Technotise: Edit & I (2009)", "Película", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/wSGbVkWZEl3556M1bia8rk5jWnn.jpg", "Serbia animada con ácido. Cyberpunk casero con personalidad desbordada."], // Por ver
  [23, "[BLACK LAGOON] Black Lagoon (2006)", "Anime", "crimen", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/sQlHhWScg6qmakL1ywtcjjVKKqV.jpg", "Río, mercenarios y ninguna regla. Black Lagoon es puro caos con encanto."], // Por ver
  [24, "[ヨルムンガンド] Jormungand (2012)", "Anime", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/2v886zu4uziTmmtjRWXaWjf1QeU.jpg", "Mercenarios globales con sonrisa de acero. Estrategia y cinismo a partes iguales."], // Por ver
  [25, "[Лучшие в аду] The Best in Hell (2022)", "OVA", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/2x1swT7xOyYZAdsKO3GclVcYrR3.jpg", "Infierno, trincheras y humor negro animado. Impacta sin hacer ruido."], // Por ver
  [26, "[GATE（ゲート）自衛隊 彼の地にて、斯く戦えり] GATE (2015)", "Anime", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/bCuJkIUg1n9etSYrrQKlQuSrigE.jpg", "Un ejército moderno en un mundo de magia. GATE engancha por su mezcla rara."], // Por ver
  [27, "[機動戦士ガンダム 第08MS小隊] Mobile Suit Gundam: The 08th MS Team (1996)", "Anime", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tzr1YdnPSIWMMgyb6Uzi3f9I8p3.jpg", "Guerra total desde la trinchera y el cockpit. Mecha con peso humano."], // Por ver
  [28, "[幼女戦記] Saga of Tanya the Evil (2017)", "Anime", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/slamFBuUGFtL4LtWpS9qXQ1qSLl.jpg", "La niña en el cuerpo de un estratega. Sátira militar con garras."], // Por ver
  [29, "[Axis Powers ヘタリア] Hetalia: Axis Powers (2009)", "Anime", "guerra", "https://image.tmdb.org/t/p/original/kJfZKulii7UKa880BLQ7WlzUwCA.jpg", "Naciones antropomórficas en guerra. Ridículo y brillante a la vez."], // Por ver
  [30, "[将国のアルタイル] Altair: A Record of Battles (2017)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/g8LNOGIqvzpMlb6XzmJhY46j1t5.jpg", "Estrategia, honor y un mapa que se mueve. Épica otomana animada."], // Por ver
  [31, "[OPPENHEIMER] Oppenheimer (2023)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/5t05uhX5ULn8Um2f1ZuznVvIffU.jpg", "Fisión, ego y tres horas de reloj. El retrato más incómodo del poder."], // Por ver
  [32, "[CHERNOBYL] Chernobyl (2019)", "Película", "desolacion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg", "Una central, una mentira y una ciudad entera en cuestión. Doloroso y necesario."], // Por ver
  [33, "[Empire of the Sun] Empire of the Sun (1987)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/6s0RoC4LuRNKnVWeQ3gq5J8uprN.jpg", "Un niño, un campamento y una guerra que no entiende. Clásico de Spielberg."], // Por ver
  [34, "[火垂るの墓] La Tumba de las Luciérnagas (1988)", "Película Anime", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/juKTAn2AuoE9MvCNvf3kwZrt1t4.jpg", "Dos hermanos, luciérnagas y hambre. La película que no se olvida."], // Por ver
  [35, "[人狼 JIN-ROH] Jin-Roh: The Wolf Brigade (1999)", "Película Anime", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/iyLKFR339GCzTKUtrVO4hbeEhub.jpg", "Lobo, máscara y política de ocupación. Animación adulta con densidad de novela."], // Por ver
  [36, "[Lepa sela lepo gore] Pretty Village, Pretty Flame (1996)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/kh4VuXrgAmQCSKFsQHXdZ03l0rC.jpg", "Aldea bonita, guerra fea. Humor negro balcánico en estado puro."], // Por ver
  [37, "[Балканский рубеж] The Balkan Line (2019)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/anL1b22zyf9NnM3BPuy9tZxb22a.jpg", "Frontera, propaganda y barro. Cine bélico reciente sin triunfalismo."], // Por ver
  [38, "[Savior] Savior (1998)", "Película", "guerra", "https://image.tmdb.org/t/p/original/6aHRUTqZr5C6te3VYGSJcnlS5bl.jpg", "Un mercenario, una ciudad sitiada y ninguna esperanza. Duro, seco, honesto."], // Por ver
  [39, "[Krugovi] Circles (2013)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/jfLN4kwSPcKsBbcs2r6a6SizQmv.jpg", "Círculos que se cierran en Sarajevo. Un drama que se te queda dentro."], // Por ver
  [40, "[In the Land of Blood and Honey] In the Land of Blood and Honey (2011)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/h1r4qey0K8PG9OgQdDqQcXtMq6c.jpg", "Amor en tiempos de ocupación. Pulso firme y ninguna concesión fácil."], // Por ver
  [41, "[Savršeni krug] The Perfect Circle (1997)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/nz817P2e8wS7JPIiY5QyKv5myCz.jpg", "Un fusil, un amigo y un recuerdo. Cine yugoslavo de una ternura brutal."], // Por ver
  [42, "[Чистилище (Chistilishche)] Purgatory (1998)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/6MCMEAHc9HSVmmGc07ZsfvP3Xic.jpg", "Infierno, humo y soldados sin causa. Animación rusa que no suaviza nada."], // Por ver
  [43, "[Vals im Bashir] Vals con Bashir (2008)", "Película", "guerra", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tdr54JxHqP01QmgSW53nBvHrxPe.jpg", "Animación, baile y culpa. Documental disfrazado de pesadilla."], // Por ver
  [44, "[少女終末旅行] Girls' Last Tour (2017)", "Anime", "desolacion", "https://image.tmdb.org/t/p/original/52MoeswRoEgREmpfAoM5BLjOt83.jpg", "Dos chicas, un tanque y un mundo vacío. La desolación más tierna que existe."], // Por ver
  [45, "[Children of Men] Niños del hombre (2006)", "Película", "desolacion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/jxVLES5eTLuJgeYs0ywCLZbbQW1.jpg", "El futuro es un autobús y nadie baja. Ciencia ficción conmovedora y exacta."], // Por ver
  [46, "[コッペリオン] COPPELION (2013)", "Anime", "desolacion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/mPQuea0bhoh4oV9nRmJpisHUiZ0.jpg", "Radioactividad, sonrisas y un país que se apaga. Anime sobreviviente."], // Por ver
  [47, "[天国大魔境 TENGOKU-DAIMAKYO] Heavenly Delusion (2023)", "Anime", "desolacion", "https://image.tmdb.org/t/p/original/oS7Z0CocQE9rRoY7FEbMH2vPfGD.jpg", "Un paraíso con trampa y una promesa por cumplir. Misterio con alma."], // Por ver
  [48, "[Hurry Up Tomorrow] Hurry Up Tomorrow: Más allá de los reflectores (2025)", "Película", "mente", "https://image.tmdb.org/t/p/original/5n6CYHmDWCEZwQ8tiURcOdqZUdb.jpg", "Famoso, solo y al borde. Un retrato del vacío detrás de los focos."], // Por ver
  [49, "[ターミネーター 0] Terminator Zero (2024)", "Anime", "desolacion", "https://image.tmdb.org/t/p/original/v4sbn6IsJGAIZNHjdB4CprvS7zo.jpg", "Terminator en versión anime: mismo bucle, nuevo código. Cyberpunk con reloj."], // Por ver
  [50, "[北斗の拳 (Hokuto no Ken)] El Puño de la Estrella del Norte (1986)", "Película Anime", "desolacion", "https://image.tmdb.org/t/p/original/2YCNdrSstrYovSYyKMCDxkkDUsC.jpg", "Puño, hambre y estrellas. El posapocalipsis más salvaje del manga."], // Por ver
  [51, "[BLAME!] Blame! (2017)", "Película Anime", "desolacion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/7eoRQY7VUMawwBnuD6uwN4szc8k.jpg", "Ciudad infinita, monos y una misión sin sentido. Blame! es laberinto puro."], // Por ver
  [52, "[Pulp Fiction] Pulp Fiction (1994)", "Película", "crimen", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", "Maletín, baile y diálogo que corta. La estructura narrativa hecha película."], // Por ver
  [53, "[HEAT] Fuego contra Fuego (1995)", "Película", "crimen", "https://image.tmdb.org/t/p/original/3bhLxeLNqYvqEPpLmkUZCUWCMKO.jpg", "Dos tipos, un techo y un disparo. Pacino y De Niro en estado de gracia."], // Por ver
  [54, "[バッカーノ!] Baccano! (2007)", "Anime", "crimen", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qOxUTQAOTrMKTHuC9HQZiVsTK0F.jpg", "Trenes, inmortales y ley seca. Caos narrativo que se agradece."], // Por ver
  [55, "[Fight Club] El Club de la Pelea (1999)", "Película", "mente", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/sgTAWJFaB2kBvdQxRGabYFiQqEK.jpg", "¿Sabes quién soy? Jab, jab, right hook. Sátira con sudor y sangre."], // Visto
  [56, "[올드보이] Oldboy (2003)", "Película", "crimen", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/45kRW1xgTq3QrZltL9mY9e9iYkH.jpg", "Venganza, identidad y un pasillo interminable. Corea en estado puro."], // Por ver
  [57, "[Like a Dragon: Yakuza] Like a Dragon: Yakuza (2024)", "Serie", "crimen", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4uFt0lyo2UrMkTKCXH2VgxWz2jE.jpg", "Yakuza, honor y Tokio nocturno. Serie que no se corta en el golpe."], // Por ver
  [58, "[Next] El Vidente (2007)", "Película", "mente", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/yNeoZYQ93Mkl6NxdEGuoBKJz1G8.jpg", "Ves segundos por delante y aun así llegas tarde. Ciencia ficción de Cage."], // Por ver
  [59, "[DARKER THAN BLACK -黒の契約者-] Darker than Black (2007)", "Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/i2jS5N0FK9o58Lxh5mnkOzEDZsd.jpg", "Contratistas, sombras y un clima que pesa. Noir sobrenatural con clase."], // Por ver
  [60, "[LAZARUS ラザロ] Lazarus (2025)", "Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ActpqKbShWGYNDRsCjTueRixlrr.jpg", "IA, cerebro robado y un plan que nadie entiende. Watanabe al volante."], // Por ver
  [61, "[紅の豚] Porco Rosso (1992)", "Película Anime", "espiritu", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/j3RaEwYQ2D4fbdr3nMa3JXSK15o.jpg", "Cerdos voladores, viento y un piloto con deuda. Ghibli con motor."], // Por ver
  [62, "[TOP GUN] Top Gun: Maverick (2022)", "Película", "accion", "https://image.tmdb.org/t/p/original/bA1XVOT1UHszYrWmCDkq3yN1ROy.jpg", "Jets, ego y una curva que no se puede volar. Adrenalina contemporánea."], // Por ver
  [63, "[Whiplash] Whiplash (2014)", "Película", "accion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/sL32IZkyjlF7otj5vcUxiKSKzg5.jpg", "Baquetas, sangre y un metrónomo cruel. La música como tortura y salvación."], // Por ver
  [64, "[Nobody] Nadie (2021)", "Película", "accion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ddO5a3tMPpQutSDQO1bESgLWadB.jpg", "Un tipo normal contra media Europa. Acción coreográfica sin estrellato."], // Por ver
  [65, "[Atomic Blonde] Atómica (2017)", "Película", "accion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/9DRFozlq1IMD7aMLzdRzWEEH6SH.jpg", "Guerra fría, rubia letal y cuchillo. Estilo con mayúsculas."], // Por ver
  [66, "[The Raid: Redemption] The Raid (2011)", "Película", "accion", "https://image.tmdb.org/t/p/original/Abnm1Ws3JH0ReCfEhLMPwPcMcGO.jpg", "Escaleras, pasillos y puños. Cien minutos de respiración entrecortada."], // Por ver
  [67, "[GHOST IN THE SHELL / 攻殻機動隊] Ghost in the Shell (1995)", "Película Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/mo4PUj0SWiX33uQMgxyzE2ZOPBK.jpg", "Cuerpo, prótesis y un fantasma que piensa. La pregunta sigue sin respuesta."], // Por ver
  [68, "[イノセンス] Ghost in the Shell 2: Innocence (2004)", "Película Anime", "cyberpunk", "https://image.tmdb.org/t/p/original/w2JxX0zCHtTU7XrNjHBij2uZKiV.jpg", "Muñecas, memoria y un barco de basura. Oshii se pone aún más abstracto."], // Por ver
  [69, "[The Animatrix] Animatrix (2003)", "Película Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/g52SOsTvdjzY8oPIn5znLJMzLHG.jpg", "Nine Lives, reloader y gatos. La mejor forma de ampliar el universo Matrix."], // Por ver
  [70, "[The Matrix] Matrix (1999)", "Película", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/5cDHSeoVVZqypEkphJQ0a4FHRjF.jpg", "Píldora roja. Todo lo demás es decorado."], // Visto
  [71, "[Gattaca] Gattaca (1997)", "Película", "mente", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1gXcEISnpV8IXCylhGI4eyBKjM.jpg", "Genética como destino. Ciencia ficción de oficina con ADN de clásico."], // Por ver
  [72, "[Equilibrium] Equilibrium (2002)", "Película", "mente", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/eW3YrxOh3rd6PnRgMSftYoflvfe.jpg", "Gimnasia, pan y un régimen que no se come. Distopía con musculatura."], // Por ver
  [73, "[エルゴプラクシー] Ergo Proxy (2006)", "Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tHcce6PKnhNBneSMbadI4jynHpY.jpg", "Robots, cultivos y una lluvia que no cesa. Filosofía con atmósfera."], // Por ver
  [74, "[虐殺器官] Genocidal Organ (2017)", "Película Anime", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/aL5mNV5UgUoQ00qsC6dvwgQcIbA.jpg", "Órganos, guerra y un idioma que se come solo. Anime incómodo y necesario."], // Por ver
  [75, "[The Man in the High Castle] The Man in the High Castle (2015)", "Serie", "desolacion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4IljeGfUK3QpYxDUJKyi7K411Ro.jpg", "Estados Unidos perdió la guerra y alguien lo narra. Distopía de terror calmado."], // Por ver
  [76, "[NieR:Automata Ver1.1a] NieR:Automata Ver1.1a (2023)", "Anime", "desolacion", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qHSCYOXHV3EKXKkMxUvC9rGx4Av.jpg", "Androides, ruinas y un robot que sonríe. Los últimos minutos lo explican todo."], // Por ver
  [77, "[はじめの一歩] Hajime no Ippo: The Fighting! (2000)", "Anime", "espiritu", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1LApB9C9kEkh2ZU2vzAhurNDipl.jpg", "Boxeo, barrio y un apellido pesado. Shonen de los de antes."], // Por ver
  [78, "[ゴールデンボーイ] Golden Boy (1995)", "Anime", "espiritu", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ahkQ6qnqouwZw7nro2YDEYLzrNn.jpg", "Un genio con gafas y cinco minutos muertos. Comedia con piernas."], // Por ver
  [79, "[時々ボソッとロシア語でデレる隣のアーリャさん] Alya Sometimes Hides Her Feelings in Russian (2024)", "Anime", "espiritu", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/hfnzByZIRj6rx8xaxzS2zDilei1.jpg", "Rusa, rubia y un diccionario de cumplidos. Romcom con acento."], // Por ver
  [80, "[エクセル・サーガ] Excel Saga (1999)", "OVA", "espiritu", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/sr5nHUOuGDmysbANKJN1eV2wzrX.jpg", "Caos, sátira y una coneja con planes. Excel Saga no se explica, se padece."], // Por ver
  [81, "[トモちゃんは女の子!] Tomo-chan Is a Girl! (2023)", "Anime", "espiritu", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/h9TN2BltJ9Q7FZ5BYGQcHfYfEGp.jpg", "Ella es chica, él no se enteró. Comedia con golpes y gracia."], // Por ver
  [82, "[天幕のジャードゥーガル] A Witch's Life in Mongol (2021)", "Manga", "espiritu", "https://upload.wikimedia.org/wikipedia/en/b/b4/A_Witch%27s_Life_in_Mongol_volume_1_cover.jpg", "Mongol, brujería y una vida que no encaja. Manga histórico con pulso actual."], // Por ver
  [83, "[パプリカ] Paprika (2006)", "Película Anime", "mente", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/j9QZkFkaR9LmvRumn88te0d6qsC.jpg", "Sueños que se prestan y realidades que se rompen. Satoshi Kon en estado puro."], // Por ver
  [84, "[PERFECT BLUE] Perfect Blue (1998)", "Película Anime", "mente", "https://image.tmdb.org/t/p/original/79vujbsWEbX4dzffBV541QXN6sf.jpg", "Maquillaje, espejos y una carrera que se deshace. Thriller psicológico."], // Visto
  [85, "[TENET] TENET (2020)", "Película", "mente", "https://image.tmdb.org/t/p/original/67p7XVP5SLup521iD9cAayMNt2U.jpg", "No lo entiendes, pero sientes el reloj. Nolan jugando con el montaje."], // Por ver
  [86, "[Blade Runner 2049] Blade Runner 2049 (2017)", "Película", "cyberpunk", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/cOt8SQwrxpoTv9Bc3kyce3etkZX.jpg", "Neón, lluvia y un coyote viejo. La secuela que sí estaba a la altura."], // Por ver
  [87, "[無限の住人] Blade of the Immortal (2008)", "Anime", "demonios", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ufo6y5FUdhUOXc97zZhpvmcQLRP.jpg", "Espada, tatuaje y una tumba que no llega. Samurai con sed de justicia."], // Por ver
  [88, "[無限の住人-IMMORTAL-] Mugen no Juunin: Immortal (2019)", "Anime", "demonios", "https://image.tmdb.org/t/p/original/dx8PMM2cQSe4dmzLtj1sBkAIYHw.jpg", "Inmortal, cansado y rodeado de demonios. La versión que se queda contigo."], // Por ver
  [89, "[鬼武者] Onimusha (2023)", "Anime", "demonios", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/lfRmDHegR8OpU3859lBz9YHgD79.jpg", "Demonios feudales, armadura y un clan que no se rinde. Acción ancestral."], // Por ver
  [90, "[クレイモア] Claymore (2007) ", "Anime", "demonios", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/rQt8X4kjBxah0laGwUVJISf1086.jpg", "Espadas, yoma y un cuerpo prestado. Oscuro, elegante, implacable."], // Por ver
  [91, "[Devil May Cry] Devil May Cry (2025)", "Anime", "demonios", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/mX9tqfpjqwreONJHhap7SnSSowe.jpg", "Dante, café y un contrato eterno. Estilo demoníaco con actitud."], // Por ver
  [92, "[チェンソーマン レゼ篇] Chainsaw Man - The Movie: Reze Arc (2025)", "Película Anime", "demonios", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/3gq3Nc6wkgXrjPTkebAwOwe8l7x.jpg", "Motorsierra, reze y un beso con explosión. El anime del año en pantalla grande."], // Por ver
  [93, "[ダンダダン] Dandadan (2024)", "Anime", "demonios", "https://image.tmdb.org/t/p/w600_and_h900_bestv2/bOPmmOXj33bxVW5DoWabkCLn6vE.jpg", "Aliens, fantasmas y adolescentes con problemas. Energía desbordada."], // Por ver
  [94, "[チェーンスモーカーキャット] Chainsmoker Cat (2026)", "Anime", "espiritu", "https://image.tmdb.org/t/p/original/m7AnmAtTDC5qfEp3BcLSSJerBzM.jpg", "Un gato, humo y un humor tan negro como su pelaje. Rareza de Netflix con garras."], // Por ver
  [95, "[STEEL BALL RUN] JoJo's Bizarre Adventure: Steel Ball Run (2026)", "Anime", "accion", "https://image.tmdb.org/t/p/original/yB2cUOuT3OMGtU3CTLQjuFUL8Ox.jpg", "Caballos, stands y una carrera cruzando América. JoJo cambia de marcha."], // Por ver
  [96, "[サイバーパンク エッジランナーズ2] Cyberpunk: Edgerunners 2 (2026)", "Anime", "cyberpunk", "https://image.tmdb.org/t/p/original/w3XGb8zwhiq9sUEGWCPY0ZNOWmh.jpg", "Night City vuelve a morder. Nueva historia, mismo neón letal."], // Por ver
  [97, "[SCP:GALLIONIC] SCP: Gallionic (2026)", "Anime", "demonios", "https://i.ytimg.com/vi/RSbPdf3CGD8/maxresdefault.jpg", "Cortometraje indie: una brecha, dos hermanos y algo que no debería existir."], // Por ver
]

const SEEN_IDS = new Set<number>([9, 12, 55, 70, 84])

export const catalog: MediaItem[] = rows.map(
  ([id, title, type, collection, imageUrl, note]) => ({
    id,
    title,
    type,
    collection,
    imageUrl,
    note,
    status: SEEN_IDS.has(id) ? 'Visto' : 'Por ver',
  }),
)

/** Año extraído del título original. */
export const getYear = (item: MediaItem): string =>
  item.title.match(/\((\d{4})\)/)?.[1] ?? '—'

/** Título en su idioma original (lo que estaba entre corchetes). */
export const getOriginalTitle = (item: MediaItem): string =>
  item.title.match(/^\[(.*?)\]/)?.[1] ?? ''

/** Título limpio para la tarjeta, sin corchetes ni año. */
export const getDisplayTitle = (item: MediaItem): string =>
  item.title.replace(/^\[.*?\]\s*/, '').replace(/\s*\(\d{4}\)\s*$/, '')
