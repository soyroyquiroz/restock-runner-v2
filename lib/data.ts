// ============================================================
// RESTOCK RUNNER — CATÁLOGO MAESTRO
// El estándar depende de ENTIDAD y, en Main Hotel, del ESPACIO.
//   steps       -> cuántas unidades visuales hay al 100%
//   pcsPerStep  -> piezas que representa cada unidad visual
//   pcsBox      -> piezas por caja (para convertir a CAJAS al final)
// ============================================================

export type Entity = 'outside' | 'main'
export type RestockType = 'profundidad' | 'urgente'

export interface Standard { steps: number; pcsPerStep: number }

export interface Item {
  id: number
  es: string
  pcsBox: number
  unitLabel: string
  unitLabelPlural: string
  priority: 'high' | 'medium' | 'low'
  in: Entity[]
  outside?: Standard   // estándar por bridge
  main?: Standard      // estándar Piso 2 y 3
  TODO?: string        // dato aún no confirmado por Rodrigo
}

const U = (s: string, p: string) => ({ unitLabel: s, unitLabelPlural: p })

export const ITEMS: Item[] = [
  // ---------- HIGH (entran en URGENTE) ----------
  { id: 1, es: 'Toilet Paper', pcsBox: 60, ...U('hilera','hileras'), priority: 'high', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 12 }, main: { steps: 4, pcsPerStep: 36 } },

  { id: 2, es: 'Paper Towel', pcsBox: 30, ...U('hilera','hileras'), priority: 'high', in: ['outside'],
    outside: { steps: 3, pcsPerStep: 5 } },

  { id: 3, es: 'Soap', pcsBox: 200, ...U('cuarto de bin','cuartos de bin'), priority: 'high', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 34 }, main: { steps: 4, pcsPerStep: 50 } },

  { id: 4, es: 'Coffee Pods', pcsBox: 100, ...U('caja verde','cajas verdes'), priority: 'high', in: ['outside','main'],
    outside: { steps: 2, pcsPerStep: 24 }, main: { steps: 30, pcsPerStep: 24 } },

  { id: 5, es: 'Tea Pods', pcsBox: 100, ...U('caja verde','cajas verdes'), priority: 'high', in: ['outside','main'],
    outside: { steps: 2, pcsPerStep: 24 }, main: { steps: 30, pcsPerStep: 24 } },

  { id: 6, es: 'Water', pcsBox: 24, ...U('case','cases'), priority: 'high', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 24 }, main: { steps: 10, pcsPerStep: 24 } },

  // ---------- MEDIUM ----------
  { id: 7, es: 'Decaf Pods', pcsBox: 100, ...U('caja verde','cajas verdes'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 2, pcsPerStep: 24 }, main: { steps: 30, pcsPerStep: 24 } },

  { id: 8, es: 'Kleenex', pcsBox: 30, ...U('hilera','hileras'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 3, pcsPerStep: 27 }, main: { steps: 3, pcsPerStep: 27 } },

  { id: 9, es: 'Coffee Cups', pcsBox: 400, ...U('sleeve','sleeves'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 3, pcsPerStep: 14 }, main: { steps: 7, pcsPerStep: 18 } },

  { id: 10, es: 'Vanity Kit', pcsBox: 100, ...U('cuarto de bin','cuartos de bin'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 9 }, main: { steps: 4, pcsPerStep: 60 } },

  { id: 11, es: 'Shower Caps', pcsBox: 100, ...U('cuarto de bin','cuartos de bin'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 9 }, main: { steps: 4, pcsPerStep: 25 }, TODO: 'pcs por caja en Main sin confirmar' },

  { id: 12, es: 'Laundry Bags', pcsBox: 30, ...U('bolsa','bolsas'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 2, pcsPerStep: 15 }, main: { steps: 2, pcsPerStep: 15 } },

  // ---------- EMBOTELLADOS (toda la isla) ----------
  // Outside: 1 caja de cada uno. Main Piso 2/3: 3 cajas de cada uno.
  { id: 13, es: 'Body Lotion', pcsBox: 12, ...U('caja','cajas'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 12 }, main: { steps: 3, pcsPerStep: 12 } },
  { id: 14, es: 'Body Wash', pcsBox: 12, ...U('caja','cajas'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 12 }, main: { steps: 3, pcsPerStep: 12 } },
  { id: 15, es: 'Shampoo', pcsBox: 12, ...U('caja','cajas'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 12 }, main: { steps: 3, pcsPerStep: 12 } },
  { id: 16, es: 'Conditioner', pcsBox: 12, ...U('caja','cajas'), priority: 'medium', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 12 }, main: { steps: 3, pcsPerStep: 12 } },

  // ---------- LOW (solo PROFUNDIDAD) ----------
  { id: 17, es: 'Palmolive', pcsBox: 72, ...U('botellita','botellitas'), priority: 'low', in: ['outside','main'],
    outside: { steps: 6, pcsPerStep: 1 }, main: { steps: 12, pcsPerStep: 1 }, TODO: 'estándar Main sin confirmar' },

  { id: 18, es: 'Corkscrew', pcsBox: 50, ...U('pieza','piezas'), priority: 'low', in: ['outside','main'],
    outside: { steps: 6, pcsPerStep: 1 }, main: { steps: 12, pcsPerStep: 1 }, TODO: 'pcs por caja y estándar Main sin confirmar' },

  { id: 19, es: 'Condiment Kit', pcsBox: 240, ...U('bolsa (25 pzs)','bolsas (25 pzs)'), priority: 'low', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 25 }, main: { steps: 4, pcsPerStep: 25 }, TODO: 'cuántas bolsas por bridge y por piso' },

  { id: 20, es: 'Makeup Wipes', pcsBox: 200, ...U('caja','cajas'), priority: 'low', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 200 }, main: { steps: 1, pcsPerStep: 200 }, TODO: 'estándar Main sin confirmar' },

  { id: 21, es: 'Coasters', pcsBox: 1000, ...U('caja','cajas'), priority: 'low', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 1000 }, main: { steps: 1, pcsPerStep: 1000 }, TODO: 'estándar sin confirmar' },

  { id: 22, es: 'Notepads', pcsBox: 30, ...U('pack','packs'), priority: 'low', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 30 }, main: { steps: 4, pcsPerStep: 30 }, TODO: 'estándar por bridge sin confirmar' },

  { id: 23, es: 'Pens', pcsBox: 150, ...U('caja','cajas'), priority: 'low', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 150 }, main: { steps: 1, pcsPerStep: 150 }, TODO: 'estándar sin confirmar' },

  // ---------- SOLO MAIN HOTEL ----------
  { id: 24, es: 'Toothpaste', pcsBox: 24, ...U('caja','cajas'), priority: 'low', in: ['main'],
    main: { steps: 1, pcsPerStep: 24 } },
  { id: 25, es: 'Razors', pcsBox: 144, ...U('caja','cajas'), priority: 'low', in: ['main'],
    main: { steps: 1, pcsPerStep: 144 } },
  { id: 26, es: 'Slippers', pcsBox: 100, ...U('caja','cajas'), priority: 'low', in: ['main'],
    main: { steps: 1, pcsPerStep: 100 }, TODO: "solo Hank's Closet" },
]

export const ITEM_BY_ID: Record<number, Item> = Object.fromEntries(ITEMS.map(i => [i.id, i]))

export const LODGES = [
  { num: 1, name: 'Lodge 1', bridges: 4 },
  { num: 2, name: 'Lodge 2', bridges: 4 },
  { num: 3, name: 'Lodge 3', bridges: 4 },
  { num: 4, name: 'Lodge 4', bridges: 4 },
  { num: 5, name: 'Lodge 5', bridges: 4 },
  { num: 6, name: 'Lodge 6', bridges: 4 },
  { num: 7, name: 'Lodge 7', bridges: 6 },
  { num: 8, name: 'Lodge 8', bridges: 1 },
]

export const PISOS = ['Piso 1', 'Piso 2', 'Piso 3', "Hank's Closet"]

const CAFES = [4, 5, 7] // Coffee, Tea, Decaf

// Estándar según entidad + espacio.
// Piso 1: 1 caja de TODO, excepto cafés = 3 cajas verdes.
// Hank's Closet: solo Slippers confirmado; el resto hereda Piso 2/3.
export function getStandard(item: Item, entity: Entity, space?: string | null): Standard | null {
  if (entity === 'outside') return item.outside ?? null
  if (space === 'Piso 1') {
    if (CAFES.includes(item.id)) return { steps: 3, pcsPerStep: 24 }
    return { steps: 1, pcsPerStep: item.pcsBox }
  }
  return item.main ?? null
}

// Items visibles según entidad, espacio y tipo de restock
export function getItemsFor(entity: Entity, type: RestockType, space?: string | null): Item[] {
  let pool = ITEMS.filter(i => i.in.includes(entity) && getStandard(i, entity, space))
  if (space === "Hank's Closet") pool = pool.filter(i => i.id === 26)
  else pool = pool.filter(i => i.id !== 26)
  if (type === 'urgente') pool = pool.filter(i => i.priority === 'high')
  return pool
}

// Lo que FALTA = (unidades del estándar − unidades presentes) × piezas por unidad
export function missingPcs(item: Item, entity: Entity, space: string | null, stepsPresent: number): number {
  const std = getStandard(item, entity, space)
  if (!std) return 0
  return Math.max(0, std.steps - stepsPresent) * std.pcsPerStep
}

// Convertir piezas a CAJAS (para el boathouse)
export function pcsToBoxes(item: Item, pcs: number): { boxes: number; remainderPcs: number } {
  return { boxes: Math.floor(pcs / item.pcsBox), remainderPcs: pcs % item.pcsBox }
}
