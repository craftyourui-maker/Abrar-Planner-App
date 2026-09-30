import { useId } from 'react'
import { cx } from './cx'
import { LinearProgress } from './Progress'
import './Slider.css'

export interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label: string
  /** Screen-reader text for the current value, e.g. "4 sessions". */
  valueText?: string
  wave?: boolean
  className?: string
}

/**
 * M3 slider drawn on the wavy progress indicator, matching the kit's "Weekly target".
 * A native range input on top keeps keyboard, touch and screen-reader behavior.
 */
export function Slider({ value, min, max, step = 1, onChange, label, valueText, wave = true, className }: SliderProps) {
  const id = useId()
  const fraction = (value - min) / (max - min)
  return (
    <div className={cx('md-slider', className)} style={{ '--md-slider-fraction': fraction } as React.CSSProperties}>
      <LinearProgress value={fraction} thickness={8} wave={wave} label={label} decorative className="md-slider__track" />
      <span className="md-slider__handle" aria-hidden>
        <span className="md-slider__bubble">{value}</span>
      </span>
      <input
        id={id}
        type="range"
        className="md-slider__input"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
