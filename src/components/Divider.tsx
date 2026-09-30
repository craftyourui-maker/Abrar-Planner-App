import { cx } from './cx'

export function Divider({ inset, className }: { inset?: boolean; className?: string }) {
  return (
    <hr
      className={cx(className)}
      style={{
        border: 'none',
        height: 1,
        margin: inset ? '0 16px' : 0,
        background: 'var(--md-sys-color-outline-variant)',
      }}
    />
  )
}
