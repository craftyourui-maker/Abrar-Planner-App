import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from './cx'
import './Progress.css'

const GAP = 4 // px between the active indicator and the track
const WAVE_PERIOD = 1200 // ms for the wave to travel one wavelength
const VALUE_EASE = 0.12 // fraction of the remaining distance covered per frame at 60fps
const SPIN_CYCLE = 1333 // ms per grow/shrink cycle of the indeterminate arc
const SPIN_ROTATION = 1568 // ms per full base rotation
const ARC_MIN = 0.1 // indeterminate arc length, as a fraction of the circle
const ARC_MAX = 0.75
const LINEAR_WAVELENGTH = 40

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** Tracks whether the element is on screen, so offscreen indicators stop animating. */
function useInView<T extends Element>(ref: React.RefObject<T | null>) {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return inView
}

/** Calls `onFrame(elapsedMs, deltaMs)` every animation frame while `running`. */
function useAnimationFrame(running: boolean, onFrame: (elapsed: number, delta: number) => void) {
  const callback = useRef(onFrame)
  useLayoutEffect(() => {
    callback.current = onFrame
  })
  useEffect(() => {
    if (!running) return
    let id = 0
    let start: number | undefined
    let last: number | undefined
    const tick = (now: number) => {
      start ??= now
      callback.current(now - start, last === undefined ? 16.7 : now - last)
      last = now
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [running])
}

/** Eases a displayed value toward its target, and runs the wave phase while visible. */
function useIndicatorMotion(target: number, opts: { wave: boolean; spin: boolean; inView: boolean }) {
  const reduced = usePrefersReducedMotion()
  const [shown, setShown] = useState(reduced ? target : 0)
  const [phase, setPhase] = useState(0)
  const [spin, setSpin] = useState({ start: 0, length: ARC_MIN })
  const settling = Math.abs(shown - target) > 0.0005

  useAnimationFrame(!reduced && opts.inView && (opts.wave || opts.spin || settling), (elapsed, delta) => {
    if (opts.wave) setPhase(((elapsed % WAVE_PERIOD) / WAVE_PERIOD) * 2 * Math.PI)
    if (opts.spin) {
      // Classic M3 spinner: the arc grows (head leads), then shrinks (tail catches
      // up), and each cycle starts where the last one ended while the whole thing rotates.
      const cycle = Math.floor(elapsed / SPIN_CYCLE)
      const p = (elapsed % SPIN_CYCLE) / SPIN_CYCLE
      const grow = ARC_MAX - ARC_MIN
      const length = p < 0.5 ? ARC_MIN + grow * easeInOut(p * 2) : ARC_MAX - grow * easeInOut((p - 0.5) * 2)
      const tail = cycle * grow + (p < 0.5 ? 0 : grow * easeInOut((p - 0.5) * 2))
      setSpin({ start: (tail * 360 + (elapsed / SPIN_ROTATION) * 360) % 360, length })
    } else if (settling) {
      setShown((s) => {
        const k = 1 - Math.pow(1 - VALUE_EASE, delta / 16.7)
        const next = s + (target - s) * k
        return Math.abs(target - next) < 0.0005 ? target : next
      })
    }
  })

  return { reduced, value: reduced || !opts.inView ? target : shown, phase: reduced ? 0 : phase, spin }
}

function useWidth<T extends Element>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

function wavePath(x0: number, x1: number, cy: number, amplitude: number, phase: number) {
  if (x1 <= x0) return ''
  const y = (x: number) => (cy + amplitude * Math.sin((2 * Math.PI * x) / LINEAR_WAVELENGTH - phase)).toFixed(2)
  let d = `M ${x0} ${y(x0)}`
  for (let x = x0 + 2; x < x1; x += 2) d += ` L ${x} ${y(x)}`
  return `${d} L ${x1.toFixed(2)} ${y(x1)}`
}

export interface LinearProgressProps {
  /** 0–1 */
  value: number
  /** Stroke thickness; the kit uses 4dp and 8dp. */
  thickness?: 4 | 8
  wave?: boolean
  label: string
  /** Hide from assistive tech when another control (e.g. a slider) already conveys the value. */
  decorative?: boolean
  className?: string
}

export function LinearProgress({ value, thickness = 4, wave, label, decorative, className }: LinearProgressProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const inView = useInView(ref)
  const target = clamp01(value)
  const motion = useIndicatorMotion(target, { wave: !!wave, spin: false, inView })
  const v = motion.value
  const amplitude = wave ? thickness / 2 + 1 : 0
  const height = thickness + amplitude * 2
  const cy = height / 2
  const r = thickness / 2
  const activeEnd = Math.max(r, v * width - r)
  // Both round caps extend r past their endpoints, so the visible gap needs 2r on top.
  const trackStart = v > 0.001 ? activeEnd + GAP + 2 * r : r

  return (
    <div
      ref={ref}
      role={decorative ? undefined : 'progressbar'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      aria-valuemin={decorative ? undefined : 0}
      aria-valuemax={decorative ? undefined : 100}
      aria-valuenow={decorative ? undefined : Math.round(target * 100)}
      className={cx('md-linear-progress', className)}
      style={{ height }}
    >
      {width > 0 && (
        <svg width={width} height={height} aria-hidden>
          {trackStart < width - r && <line className="md-progress__track" x1={trackStart} x2={width - r} y1={cy} y2={cy} strokeWidth={thickness} />}
          {v > 0.001 &&
            (wave ? (
              <path className="md-progress__active" d={wavePath(r, activeEnd, cy, amplitude, motion.phase)} strokeWidth={thickness} />
            ) : (
              <line className="md-progress__active" x1={r} x2={activeEnd} y1={cy} y2={cy} strokeWidth={thickness} />
            ))}
          {/* stop indicator marks the end of the track for accessibility */}
          {v < 0.999 && <circle className="md-progress__stop" cx={width - r} cy={cy} r={2} />}
        </svg>
      )}
    </div>
  )
}

export interface CircularProgressProps {
  /** 0–1; omit for indeterminate. */
  value?: number
  size?: number
  thickness?: number
  wave?: boolean
  label: string
  /** Content centered inside the ring, e.g. a timer. */
  children?: ReactNode
  className?: string
}

export function CircularProgress({ value, size = 48, thickness = 4, wave, label, children, className }: CircularProgressProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref)
  const indeterminate = value === undefined
  const target = indeterminate ? 0 : clamp01(value)
  const motion = useIndicatorMotion(target, { wave: !!wave, spin: indeterminate, inView })

  const v = indeterminate ? (motion.reduced ? 0.25 : motion.spin.length) : motion.value
  const rotation = indeterminate && !motion.reduced ? motion.spin.start : 0
  const phase = motion.phase
  const c = size / 2
  // Wave amplitude and wavelength scale with stroke thickness so thin and thick
  // indicators keep the same silhouette.
  const amplitude = wave ? 1 + thickness * 0.2 : 0
  const radius = c - thickness / 2 - amplitude
  const waves = Math.max(6, Math.round((2 * Math.PI * radius) / Math.max(14, thickness * 2.5)))
  const gapAngle = ((GAP + thickness) / radius) * (180 / Math.PI)

  const point = (deg: number, withWave: boolean) => {
    const t = ((deg + rotation - 90) * Math.PI) / 180
    // Subtracting the phase moves crests clockwise, the direction of progress.
    const rr = radius + (withWave ? amplitude * Math.sin(waves * t - phase) : 0)
    return `${(c + rr * Math.cos(t)).toFixed(2)} ${(c + rr * Math.sin(t)).toFixed(2)}`
  }
  const arc = (fromDeg: number, toDeg: number, withWave: boolean) => {
    if (toDeg <= fromDeg) return ''
    const pts: string[] = []
    for (let a = fromDeg; a <= toDeg; a += 2) pts.push(point(a, withWave))
    pts.push(point(toDeg, withWave))
    return `M ${pts.join(' L ')}`
  }

  const activeSweep = v * 360
  const trackFrom = activeSweep + gapAngle
  const trackTo = 360 - gapAngle

  return (
    <span
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(target * 100)}
      className={cx('md-circular-progress', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} aria-hidden>
        {!indeterminate && v < 0.999 && <path className="md-progress__track" d={arc(v > 0.001 ? trackFrom : 0, trackTo, false)} strokeWidth={thickness} />}
        {v > 0.001 && <path className="md-progress__active" d={arc(0, activeSweep, !!wave)} strokeWidth={thickness} />}
      </svg>
      {children && <span className="md-circular-progress__center">{children}</span>}
    </span>
  )
}
