import type { CSSProperties } from 'react'
import { cx } from './cx'
import './Avatar.css'

export interface AvatarProps {
  /** Monogram letters; used when there is no image. */
  initials?: string
  src?: string
  alt?: string
  size?: number
  className?: string
}

export function Avatar({ initials, src, alt = '', size = 40, className }: AvatarProps) {
  return (
    <span
      className={cx('md-avatar', size >= 56 && 'md-avatar--large', className)}
      style={{ '--md-avatar-size': `${size}px` } as CSSProperties}
    >
      {src ? <img src={src} alt={alt} /> : <span aria-hidden={!alt}>{initials}</span>}
    </span>
  )
}
