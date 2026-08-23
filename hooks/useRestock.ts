import { create } from 'zustand'
import { createClient } from '@/lib/supabase'

interface RestockStore {
  entity: 'outside' | 'main' | null
  lodge: number | null
  piso: string | null
  bridge: number | null
  restockType: 'profundidad' | 'urgente' | null
  itemFill: Record<number, number>
  
  setEntity: (e: 'outside' | 'main') => void
  setLodge: (l: number) => void
  setPiso: (p: string) => void
  setBridge: (b: number) => void
  setRestockType: (t: 'profundidad' | 'urgente') => void
  setItemFill: (itemId: number, percent: number) => void
  reset: () => void
}

export const useRestock = create<RestockStore>((set) => ({
  entity: null,
  lodge: null,
  piso: null,
  bridge: null,
  restockType: null,
  itemFill: {},
  
  setEntity: (e) => set({ entity: e }),
  setLodge: (l) => set({ lodge: l }),
  setPiso: (p) => set({ piso: p }),
  setBridge: (b) => set({ bridge: b }),
  setRestockType: (t) => set({ restockType: t }),
  setItemFill: (itemId, percent) => set((state) => ({
    itemFill: { ...state.itemFill, [itemId]: Math.max(0, Math.min(100, percent)) }
  })),
  reset: () => set({
    entity: null,
    lodge: null,
    piso: null,
    bridge: null,
    restockType: null,
    itemFill: {}
  })
}))
