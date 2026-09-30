import { createContext, useContext } from 'react'

export interface SnackOptions {
  actionLabel?: string
  onAction?: () => void
}

export const SnackbarContext = createContext<(text: string, opts?: SnackOptions) => void>(() => {})

/** `const snack = useSnackbar(); snack('Saved', { actionLabel: 'Undo', onAction })` */
export const useSnackbar = () => useContext(SnackbarContext)
