import type { CSSProperties } from 'react'

/** Stagger index for `.dm-enter` children. */
export const stagger = (i: number) => ({ '--i': i }) as CSSProperties
