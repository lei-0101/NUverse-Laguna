import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
}

interface ToastStore {
  toasts: Toast[]
  add: (message: string, type?: ToastType, duration?: number) => void
  remove: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add(message, type = 'info', duration = 4000) {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({
      toasts: s.toasts.length >= 3
        ? [...s.toasts.slice(-2), { id, type, message, duration }]
        : [...s.toasts, { id, type, message, duration }],
    }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },

  remove(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },

  success(message) { useToastStore.getState().add(message, 'success') },
  error(message)   { useToastStore.getState().add(message, 'error') },
  info(message)    { useToastStore.getState().add(message, 'info') },
  warning(message) { useToastStore.getState().add(message, 'warning') },
}))

/** Convenience singleton — import this anywhere to fire toasts without hooks */
export const toast = {
  success: (m: string) => useToastStore.getState().success(m),
  error:   (m: string) => useToastStore.getState().error(m),
  info:    (m: string) => useToastStore.getState().info(m),
  warning: (m: string) => useToastStore.getState().warning(m),
}
