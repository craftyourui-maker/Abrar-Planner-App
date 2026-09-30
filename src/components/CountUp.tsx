import { useEffect, useRef, useState } from 'react'

export interface CountUpProps {
  value: number
  /** Formats the in-between numbers, e.g. with thousands separators. */
  format?: (n: number) => string
  duration?: number
  /** Start from this value on first render instead of `value`. */
  from?: number
  decimals?: number
}

const fmt = (n: number, decimals: number) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

/** Animates a number to its new value; tabular figures keep the width steady. */
export function CountUp({ value, format, duration = 700, from, decimals = 0 }: CountUpProps) {
  const [shown, setShown] = useState(from ?? value)
  const prev = useRef(from ?? value)

  useEffect(() => {
    const start = prev.current
    prev.current = value
    if (start === value || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(value)
      return
    }
    let id = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 4)
      setShown(start + (value - start) * eased)
      if (p < 1) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [value, duration])

  const rounded = decimals ? shown : Math.round(shown)
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{format ? format(rounded) : fmt(rounded, decimals)}</span>
}
