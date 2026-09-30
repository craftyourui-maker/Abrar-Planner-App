// One delegated listener gives every interactive `.md-state` element an M3 ripple
// that grows from the press point, instead of wiring each component separately.
export function installRipples() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return
      const host = (e.target as Element).closest<HTMLElement>('.md-state:not(:disabled):not([aria-disabled="true"])')
      if (!host || host.closest('[data-no-ripple]')) return
      const rect = host.getBoundingClientRect()
      const size = Math.hypot(Math.max(e.clientX - rect.left, rect.right - e.clientX), Math.max(e.clientY - rect.top, rect.bottom - e.clientY)) * 2
      const ripple = document.createElement('span')
      ripple.className = 'md-ripple'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`
      host.classList.add('md-ripple-host')
      host.appendChild(ripple)
      const release = () => {
        ripple.classList.add('md-ripple--out')
        setTimeout(() => ripple.remove(), 320)
        window.removeEventListener('pointerup', release)
        window.removeEventListener('pointercancel', release)
      }
      window.addEventListener('pointerup', release)
      window.addEventListener('pointercancel', release)
    },
    { passive: true },
  )
}
