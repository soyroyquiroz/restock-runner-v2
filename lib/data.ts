// ============================================================
// RESTOCK RUNNER — CATÁLOGO MAESTRO
// Cada estándar (outside / main) trae su PROPIA unidad visual,
// porque el mismo producto se ve distinto en un bridge que en un piso.
//   steps       -> unidades visuales al 100%
//   pcsPerStep  -> piezas que representa cada unidad
//   allowHalf   -> permite marcar media unidad (media caja, medio pack)
// ============================================================

export type Entity = 'outside' | 'main'
export type RestockType = 'profundidad' | 'urgente'

export interface Standard {
  steps: number
  pcsPerStep: number
  unit: string
  unitPlural: string
  allowHalf?: boolean
}

export interface Item {
  id: number
  es: string
  pcsBox: number
  priority: 'high' | 'medium' | 'low'
  in: Entity[]
  outside?: Standard
  main?: Standard      // Piso 2 y 3 (Piso 1 tiene regla propia)
  hanksOnly?: boolean
  TODO?: string
}

const caja = (steps: number, pcsPerStep: number): Standard =>
  ({ steps, pcsPerStep, unit: 'caja', unitPlural: 'cajas', allowHalf: true })

export const ITEMS: Item[] = [
  // ---------- HIGH (entran en URGENTE) ----------
  { id: 1, es: 'Toilet Paper', pcsBox: 60, priority: 'high', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 12, unit: 'hilera', unitPlural: 'hileras' },
    main:    { steps: 4, pcsPerStep: 36, unit: 'hilera', unitPlural: 'hileras' } },

  { id: 2, es: 'Paper Towel', pcsBox: 30, priority: 'high', in: ['outside'],
    outside: { steps: 3, pcsPerStep: 5, unit: 'hilera', unitPlural: 'hileras' } },

  { id: 3, es: 'Soap', pcsBox: 200, priority: 'high', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 34, unit: 'cuarto de bin', unitPlural: 'cuartos de bin' },
    main:    { steps: 4, pcsPerStep: 50, unit: 'cuarto de bin', unitPlural: 'cuartos de bin' } },

  { id: 4, es: 'Coffee Pods', pcsBox: 100, priority: 'high', in: ['outside','main'],
    outside: { steps: 2,  pcsPerStep: 24, unit: 'caja verde', unitPlural: 'cajas verdes' },
    main:    { steps: 30, pcsPerStep: 24, unit: 'caja verde', unitPlural: 'cajas verdes' } },

  { id: 5, es: 'Tea Pods', pcsBox: 100, priority: 'high', in: ['outside','main'],
    outside: { steps: 2,  pcsPerStep: 24, unit: 'caja verde', unitPlural: 'cajas verdes' },
    main:    { steps: 30, pcsPerStep: 24, unit: 'caja verde', unitPlural: 'cajas verdes' } },

  { id: 6, es: 'Water', pcsBox: 24, priority: 'high', in: ['outside','main'],
    outside: { steps: 4,  pcsPerStep: 24, unit: 'case', unitPlural: 'cases' },
    main:    { steps: 10, pcsPerStep: 24, unit: 'case', unitPlural: 'cases' } },

  // ---------- MEDIUM ----------
  { id: 7, es: 'Decaf Pods', pcsBox: 100, priority: 'medium', in: ['outside','main'],
    outside: { steps: 2,  pcsPerStep: 24, unit: 'caja verde', unitPlural: 'cajas verdes' },
    main:    { steps: 30, pcsPerStep: 24, unit: 'caja verde', unitPlural: 'cajas verdes' } },

  { id: 8, es: 'Kleenex', pcsBox: 30, priority: 'medium', in: ['outside','main'],
    outside: { steps: 3, pcsPerStep: 27, unit: 'hilera', unitPlural: 'hileras' },
    main:    { steps: 3, pcsPerStep: 27, unit: 'hilera', unitPlural: 'hileras' } },

  { id: 9, es: 'Coffee Cups', pcsBox: 400, priority: 'medium', in: ['outside','main'],
    outside: { steps: 3, pcsPerStep: 14, unit: 'sleeve', unitPlural: 'sleeves' },
    main:    { steps: 7, pcsPerStep: 18, unit: 'sleeve', unitPlural: 'sleeves' } },

  { id: 10, es: 'Vanity Kit', pcsBox: 100, priority: 'medium', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 9,  unit: 'cuarto de bin', unitPlural: 'cuartos de bin' },
    main:    { steps: 4, pcsPerStep: 60, unit: 'cuarto de bin', unitPlural: 'cuartos de bin' } },

  { id: 11, es: 'Shower Caps', pcsBox: 100, priority: 'medium', in: ['outside','main'],
    outside: { steps: 4, pcsPerStep: 9, unit: 'cuarto de bin', unitPlural: 'cuartos de bin' },
    main:    caja(1, 100) },

  { id: 12, es: 'Laundry Bags', pcsBox: 30, priority: 'medium', in: ['outside','main'],
    outside: { steps: 2, pcsPerStep: 15, unit: 'bolsa', unitPlural: 'bolsas' },
    main:    caja(1, 30) },

  // ---------- EMBOTELLADOS (toda la isla) ----------
  { id: 13, es: 'Body Lotion', pcsBox: 12, priority: 'medium', in: ['outside','main'], outside: caja(1, 12), main: caja(3, 12) },
  { id: 14, es: 'Body Wash',   pcsBox: 12, priority: 'medium', in: ['outside','main'], outside: caja(1, 12), main: caja(3, 12) },
  { id: 15, es: 'Shampoo',     pcsBox: 12, priority: 'medium', in: ['outside','main'], outside: caja(1, 12), main: caja(3, 12) },
  { id: 16, es: 'Conditioner', pcsBox: 12, priority: 'medium', in: ['outside','main'], outside: caja(1, 12), main: caja(3, 12) },

  // ---------- LOW (solo PROFUNDIDAD) ----------
  { id: 17, es: 'Palmolive', pcsBox: 72, priority: 'low', in: ['outside','main'],
    outside: { steps: 6, pcsPerStep: 1, unit: 'botellita', unitPlural: 'botellitas' },
    main:    caja(1, 72), TODO: 'estándar Main sin confirmar' },

  { id: 18, es: 'Corkscrew', pcsBox: 50, priority: 'low', in: ['outside','main'],
    outside: { steps: 6, pcsPerStep: 1, unit: 'pieza', unitPlural: 'piezas' },
    main:    caja(1, 50), TODO: 'pcs por caja sin confirmar' },

  { id: 19, es: 'Condiment Kit', pcsBox: 240, priority: 'low', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 25, unit: 'bolsa (25 pzs)', unitPlural: 'bolsas (25 pzs)', allowHalf: true },
    main:    caja(1, 240) },

  { id: 20, es: 'Makeup Wipes', pcsBox: 200, priority: 'low', in: ['outside','main'], outside: caja(1, 200), main: caja(1, 200) },
  { id: 21, es: 'Coasters',     pcsBox: 1000, priority: 'low', in: ['outside','main'], outside: caja(1, 1000), main: caja(1, 1000) },
  { id: 23, es: 'Pens',         pcsBox: 150, priority: 'low', in: ['outside','main'], outside: caja(1, 150), main: caja(1, 150) },

  { id: 22, es: 'Notepads', pcsBox: 30, priority: 'low', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 30, unit: 'pack', unitPlural: 'packs', allowHalf: true },
    main:    { steps: 4, pcsPerStep: 30, unit: 'pack', unitPlural: 'packs', allowHalf: true } },

  // ---------- SOLO MAIN HOTEL ----------
  { id: 24, es: 'Toothpaste', pcsBox: 24,  priority: 'low', in: ['main'], main: caja(1, 24) },
  { id: 25, es: 'Razors',     pcsBox: 144, priority: 'low', in: ['main'], main: caja(1, 144) },
  { id: 26, es: 'Slippers',   pcsBox: 100, priority: 'low', in: ['main'], main: caja(1, 100), hanksOnly: true },
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

const CAFES = [4, 5, 7]

// Piso 1: 1 caja de TODO, excepto cafés = 3 cajas verdes.
// Hank's Closet: tiene de todo (hereda Piso 2/3) y es el único con Slippers.
export function getStandard(item: Item, entity: Entity, space?: string | null): Standard | null {
  if (entity === 'outside') return item.outside ?? null
  if (space === 'Piso 1') {
    if (CAFES.includes(item.id)) return { steps: 3, pcsPerStep: 24, unit: 'caja verde', unitPlural: 'cajas verdes' }
    return caja(1, item.pcsBox)
  }
  return item.main ?? null
}

export function getItemsFor(entity: Entity, type: RestockType, space?: string | null): Item[] {
  let pool = ITEMS.filter(i => i.in.includes(entity) && getStandard(i, entity, space))
  // Slippers solo aparecen en Hank's Closet; el resto de items sí está en Hank's.
  pool = pool.filter(i => !i.hanksOnly || space === "Hank's Closet")
  if (type === 'urgente') pool = pool.filter(i => i.priority === 'high')
  return pool
}

export function missingPcs(item: Item, entity: Entity, space: string | null, stepsPresent: number): number {
  const std = getStandard(item, entity, space)
  if (!std) return 0
  return Math.round(Math.max(0, std.steps - stepsPresent) * std.pcsPerStep)
}

export function pcsToBoxes(item: Item, pcs: number): { boxes: number; remainderPcs: number } {
  return { boxes: Math.floor(pcs / item.pcsBox), remainderPcs: pcs % item.pcsBox }
}

// 1.5 -> "1.5", 2 -> "2"
export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
