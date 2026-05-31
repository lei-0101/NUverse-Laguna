import { create } from 'zustand'

export interface SuspensionInfo {
  suspendedUntil: string | null
  reason: string | null
  suspendCount: number
}

interface SuspensionState {
  info: SuspensionInfo | null
  setSuspension: (info: SuspensionInfo) => void
  clearSuspension: () => void
}

export const useSuspensionStore = create<SuspensionState>((set) => ({
  info: null,
  setSuspension: (info) => set({ info }),
  clearSuspension: () => set({ info: null }),
}))
