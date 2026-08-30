// ============================================================
// RESTOCK RUNNER — CATÁLOGO MAESTRO
// Cada item define:
//   pcsBox      -> piezas por caja (para convertir a CAJAS al final)
//   unitLabel   -> unidad VISUAL que el runner ve en el bridge/closet
//   steps       -> cuántas unidades visuales caben al 100% (slider por pasos)
//   priority    -> high = entra en URGENTE
//   in          -> dónde existe el item
// ============================================================

export type Entity = 'outside' | 'main'
export type RestockType = 'profundidad' | 'urgente'

export interface Item {
  id: number
  es: string
  pcsBox: number
  unitLabel: string      // singular
  unitLabelPlural: string
  priority: 'high' | 'medium' | 'low'
  in: Entity[]
  steps: number          // unidades visuales al 100%
  pcsPerStepOutside?: number  // piezas que representa cada unidad visual (outside)
  pcsPerStepMain?: number     // idem para main hotel
}

export const ITEMS: Item[] = [
  // ---------- HIGH (entran en URGENTE) ----------
  { id: 1,  es: 'Toilet Paper',  pcsBox: 60,    unitLabel: 'hilera',  unitLabelPlural: 'hileras', priority: 'high',   in: ['outside','main'], steps: 4,  pcsPerStepOutside: 12, pcsPerStepMain: 36 },
  { id: 2,  es: 'Paper Towel',   pcsBox: 30,    unitLabel: 'hilera',  unitLabelPlural: 'hileras', priority: 'high',   in: ['outside','main'], steps: 3,  pcsPerStepOutside: 5,  pcsPerStepMain: 10 },
  { id: 3,  es: 'Soap',          pcsBox: 200,   unitLabel: 'bin',     unitLabelPlural: 'bins',    priority: 'high',   in: ['outside','main'], steps: 4,  pcsPerStepOutside: 34, pcsPerStepMain: 50 },
  { id: 4,  es: 'Coffee Pods',   pcsBox: 100,   unitLabel: 'caja verde', unitLabelPlural: 'cajas verdes', priority: 'high', in: ['outside','main'], steps: 2, pcsPerStepOutside: 24, pcsPerStepMain: 24 },
  { id: 5,  es: 'Tea Pods',      pcsBox: 100,   unitLabel: 'caja verde', unitLabelPlural: 'cajas verdes', priority: 'high', in: ['outside','main'], steps: 2, pcsPerStepOutside: 24, pcsPerStepMain: 24 },
  { id: 6,  es: 'Water',         pcsBox: 24,    unitLabel: 'case',    unitLabelPlural: 'cases',   priority: 'high',   in: ['outside','main'], steps: 4,  pcsPerStepOutside: 24, pcsPerStepMain: 24 },

  // ---------- MEDIUM ----------
  { id: 7,  es: 'Decaf Pods',    pcsBox: 100,   unitLabel: 'caja verde', unitLabelPlural: 'cajas verdes', priority: 'medium', in: ['outside','main'], steps: 2, pcsPerStepOutside: 24, pcsPerStepMain: 24 },
  { id: 8,  es: 'Kleenex',       pcsBox: 30,    unitLabel: 'hilera',  unitLabelPlural: 'hileras', priority: 'medium', in: ['outside','main'], steps: 3,  pcsPerStepOutside: 27, pcsPerStepMain: 27 },
  { id: 9,  es: 'Coffee Cups',   pcsBox: 400,   unitLabel: 'sleeve',  unitLabelPlural: 'sleeves', priority: 'medium', in: ['outside','main'], steps: 3,  pcsPerStepOutside: 14, pcsPerStepMain: 18 },
  { id: 10, es: 'Vanity Kit',    pcsBox: 100,   unitLabel: 'bin',     unitLabelPlural: 'bins',    priority: 'medium', in: ['outside','main'], steps: 4,  pcsPerStepOutside: 9,  pcsPerStepMain: 60 },
  { id: 11, es: 'Shower Caps',   pcsBox: 100,   unitLabel: 'bin',     unitLabelPlural: 'bins',    priority: 'medium', in: ['outside','main'], steps: 4,  pcsPerStepOutside: 9,  pcsPerStepMain: 25 },
  { id: 12, es: 'Laundry Bags',  pcsBox: 30,    unitLabel: 'bolsa',   unitLabelPlural: 'bolsas',  priority: 'medium', in: ['outside','main'], steps: 2,  pcsPerStepOutside: 15, pcsPerStepMain: 15 },
  { id: 13, es: 'Makeup Wipes',  pcsBox: 200,   unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'medium', in: ['main'],           steps: 2,  pcsPerStepMain: 100 },
  { id: 14, es: 'Slippers',      pcsBox: 100,   unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'medium', in: ['main'],           steps: 2,  pcsPerStepMain: 50 },

  // ---------- LOW (solo PROFUNDIDAD) ----------
  { id: 15, es: 'Coasters',      pcsBox: 1000,  unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'low', in: ['outside','main'], steps: 2, pcsPerStepOutside: 500, pcsPerStepMain: 500 },
  { id: 16, es: 'Notepads',      pcsBox: 30,    unitLabel: 'pack',    unitLabelPlural: 'packs',   priority: 'low', in: ['main'],           steps: 4, pcsPerStepMain: 30 },
  { id: 17, es: 'Pens',          pcsBox: 150,   unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'low', in: ['main'],           steps: 2, pcsPerStepMain: 75 },
  { id: 18, es: 'Condiment Kit', pcsBox: 240,   unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'low', in: ['main'],           steps: 2, pcsPerStepMain: 120 },
  { id: 19, es: 'Palmolive',     pcsBox: 72,    unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'low', in: ['main'],           steps: 2, pcsPerStepMain: 36 },
  { id: 20, es: 'Toothpaste',    pcsBox: 24,    unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'low', in: ['main'],           steps: 2, pcsPerStepMain: 12 },
  { id: 21, es: 'Razors',        pcsBox: 144,   unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'low', in: ['main'],           steps: 2, pcsPerStepMain: 72 },
  { id: 22, es: 'Hair Products', pcsBox: 12,    unitLabel: 'bin',     unitLabelPlural: 'bins',    priority: 'low', in: ['outside','main'], steps: 2, pcsPerStepOutside: 6, pcsPerStepMain: 6 },
  { id: 23, es: 'Corkscrew',     pcsBox: 50,    unitLabel: 'caja',    unitLabelPlural: 'cajas',   priority: 'low', in: ['main'],           steps: 2, pcsPerStepMain: 25 },
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

// Items visibles según entidad + tipo de restock
export function getItemsFor(entity: Entity, type: RestockType): Item[] {
  const pool = ITEMS.filter(i => i.in.includes(entity))
  if (type === 'profundidad') return pool
  return pool.filter(i => i.priority === 'high')
}

// Piezas que representa cada unidad visual, según entidad
export function pcsPerStep(item: Item, entity: Entity): number {
  const v = entity === 'outside' ? item.pcsPerStepOutside : item.pcsPerStepMain
  return v ?? item.pcsBox
}

// Lo que FALTA = (steps totales - steps que hay) * piezas por step
export function missingPcs(item: Item, entity: Entity, stepsPresent: number): number {
  const missing = Math.max(0, item.steps - stepsPresent)
  return missing * pcsPerStep(item, entity)
}

// Convertir piezas a CAJAS (preferencia: hablar en cajas para boathouse)
export function pcsToBoxes(item: Item, pcs: number): { boxes: number; remainderPcs: number } {
  const boxes = Math.floor(pcs / item.pcsBox)
  const remainderPcs = pcs % item.pcsBox
  return { boxes, remainderPcs }
}
