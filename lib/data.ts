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
  ({ steps, pcsPerStep, unit: 'caja', unitPlural: 'cajas' })

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
    outside: { steps: 1, pcsPerStep: 25, unit: 'bolsa (25 pzs)', unitPlural: 'bolsas (25 pzs)' },
    main:    caja(1, 240) },

  { id: 20, es: 'Makeup Wipes', pcsBox: 200, priority: 'low', in: ['outside','main'], outside: caja(1, 200), main: caja(1, 200) },
  { id: 21, es: 'Coasters',     pcsBox: 1000, priority: 'low', in: ['outside','main'], outside: caja(1, 1000), main: caja(1, 1000) },
  { id: 23, es: 'Pens',         pcsBox: 150, priority: 'low', in: ['outside','main'], outside: caja(1, 150), main: caja(1, 150) },

  { id: 22, es: 'Notepads', pcsBox: 30, priority: 'low', in: ['outside','main'],
    outside: { steps: 1, pcsPerStep: 30, unit: 'pack', unitPlural: 'packs' },
    main:    { steps: 4, pcsPerStep: 30, unit: 'pack', unitPlural: 'packs' } },

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

// ============================================================
// BLOQUES DE LA ISLA
// Dentro de un bloque las distancias permiten arrastrar el sobrante
// de un lodge al siguiente. Entre bloques no: cada uno arranca limpio.
// ============================================================
export const BLOQUES: { id: string; nombre: string; lodges: number[] }[] = [
  { id: 'b1', nombre: 'Lodges 1-4', lodges: [1, 2, 3, 4] },
  { id: 'b2', nombre: 'Lodges 5-6', lodges: [5, 6] },
  { id: 'b3', nombre: 'Lodge 7',    lodges: [7] },
  { id: 'b4', nombre: 'Lodge 8',    lodges: [8] },
]

export function bloqueDe(lodge: number | null | undefined): string {
  const b = BLOQUES.find(x => lodge != null && x.lodges.includes(lodge))
  return b ? b.id : 'sin-bloque'
}

// ============================================================
// OVERRIDES DEL CATÁLOGO (editables desde la pestaña Catálogo)
// El código trae los valores por defecto; la base puede sobrescribirlos
// sin que haya que tocar código ni volver a desplegar.
// ============================================================
export interface Override { steps?: number; pcs_per_step?: number; pcs_box?: number }

let OVERRIDES: Record<string, Override> = {}

export function loadOverrides(rows: { item_id: number; scope: string; steps: number | null; pcs_per_step: number | null; pcs_box: number | null }[]) {
  OVERRIDES = {}
  rows.forEach(r => {
    OVERRIDES[`${r.item_id}|${r.scope}`] = {
      steps: r.steps ?? undefined,
      pcs_per_step: r.pcs_per_step ?? undefined,
      pcs_box: r.pcs_box ?? undefined,
    }
  })
}

export function hasOverrides(): boolean {
  return Object.keys(OVERRIDES).length > 0
}

// Piezas por caja efectivas (las del catálogo o las editadas)
export function pcsBoxOf(item: Item): number {
  return OVERRIDES[`${item.id}|box`]?.pcs_box ?? item.pcsBox
}

const CAFES = [4, 5, 7]

// Piso 1: 1 caja de TODO, excepto cafés = 3 cajas verdes.
// Hank's Closet: tiene de todo (hereda Piso 2/3) y es el único con Slippers.
export function getStandard(item: Item, entity: Entity, space?: string | null): Standard | null {
  let base: Standard | null
  if (entity === 'outside') {
    base = item.outside ?? null
  } else if (space === 'Piso 1') {
    base = CAFES.includes(item.id)
      ? { steps: 3, pcsPerStep: 24, unit: 'caja verde', unitPlural: 'cajas verdes' }
      : caja(1, pcsBoxOf(item))
  } else {
    base = item.main ?? null
  }
  if (!base) return null

  const ov = OVERRIDES[`${item.id}|${entity}`]
  if (!ov) return base
  return {
    ...base,
    steps: ov.steps ?? base.steps,
    pcsPerStep: ov.pcs_per_step ?? base.pcsPerStep,
  }
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
  const box = pcsBoxOf(item)
  return { boxes: Math.floor(pcs / box), remainderPcs: pcs % box }
}

// Unidades que NO se pueden partir a la mitad
const WHOLE_ONLY = ['botellita', 'pieza']

export function allowsHalf(std: Standard): boolean {
  if (std.allowHalf !== undefined) return std.allowHalf
  return !WHOLE_ONLY.includes(std.unit)
}

// 1.5 -> "1.5", 2 -> "2"
export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

// ============================================================
// LÓGICA DE ENTREGA POR BRIDGE
// Si falta menos del 30% de una caja -> se dejan piezas sueltas.
// Si falta 30% o más -> se deja la caja completa en el bridge.
// Nace de que no siempre traes el carrito de golf: por poco no vale
// la pena cargar una caja, y por mucho no vale la pena contar piezas.
// ============================================================
export const BOX_THRESHOLD = 0.30

export interface Delivery {
  mode: 'pcs' | 'boxes' | 'nada'
  boxes: number
  loosePcs: number
  totalPcs: number   // lo que realmente dejas, no lo que falta
  label: string
}

export function deliveryPlan(item: Item, missing: number): Delivery {
  if (missing <= 0) return { mode: 'nada', boxes: 0, loosePcs: 0, totalPcs: 0, label: 'nada' }

  const box = pcsBoxOf(item)
  const ratio = missing / box

  if (ratio < BOX_THRESHOLD) {
    return { mode: 'pcs', boxes: 0, loosePcs: missing, totalPcs: missing, label: `${missing} pzs sueltas` }
  }

  // Arriba del umbral: cajas completas MÁS las piezas exactas que falten.
  // No se redondea hacia arriba: nunca se manda de más asumiendo que hay
  // sobrantes de una caja abierta, porque esos sobrantes no están registrados.
  const boxes = Math.floor(ratio)
  const loose = missing - boxes * box

  // Entre 30% y una caja: se lleva la caja completa (no hay de dónde sacar sueltas).
  if (boxes === 0) {
    return { mode: 'boxes', boxes: 1, loosePcs: 0, totalPcs: box, label: '1 caja' }
  }

  const partes = [`${boxes} caja${boxes > 1 ? 's' : ''}`]
  if (loose > 0) partes.push(`${loose} pzs`)
  return {
    mode: 'boxes', boxes, loosePcs: loose, totalPcs: missing,
    label: partes.join(' + '),
  }
}

// ============================================================
// REPARTO POR LODGE CON SALDO ARRASTRADO
// El proceso físico: llegas con el carrito, parkeas una caja en el
// primer bridge que la necesita, sacas lo de ese bridge y te llevas
// el sobrante al siguiente. Solo abres otra caja cuando el sobrante
// ya no alcanza. Por eso el cálculo es del LODGE completo en orden
// de ruta, no de cada bridge por separado.
// ============================================================

export interface StopNeed { key: string; missing: number }

export interface StopAlloc {
  key: string
  park: number        // cajas que parkeas EN este bridge
  use: number         // piezas que dejas aquí
  fromCarry: number   // cuántas de esas venían del sobrante que traías
  carryAfter: number  // sobrante que te llevas al siguiente
  loose: boolean      // el lodge entero va en piezas sueltas, sin abrir caja
}

export function allocateAcrossStops(item: Item, stops: StopNeed[]): StopAlloc[] {
  const total = stops.reduce((s, x) => s + x.missing, 0)

  if (total <= 0) {
    return stops.map(s => ({ key: s.key, park: 0, use: 0, fromCarry: 0, carryAfter: 0, loose: false }))
  }

  // Si el lodge entero necesita menos del umbral, no vale la pena abrir caja
  const box = pcsBoxOf(item)
  if (total < box * BOX_THRESHOLD) {
    return stops.map(s => ({ key: s.key, park: 0, use: s.missing, fromCarry: 0, carryAfter: 0, loose: true }))
  }

  let carry = 0
  return stops.map(s => {
    let park = 0
    const fromCarry = Math.min(carry, s.missing)
    while (carry < s.missing) { park++; carry += box }
    carry -= s.missing
    return { key: s.key, park, use: s.missing, fromCarry, carryAfter: carry, loose: false }
  })
}

// Cajas totales del boathouse para un lodge = suma de lo que parkeas
export function boxesForStops(item: Item, stops: StopNeed[]): { boxes: number; loosePcs: number } {
  const alloc = allocateAcrossStops(item, stops)
  return {
    boxes: alloc.reduce((s, a) => s + a.park, 0),
    loosePcs: alloc.filter(a => a.loose).reduce((s, a) => s + a.use, 0),
  }
}
