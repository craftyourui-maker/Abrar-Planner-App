// Each hobby gets a tonal pairing from the scheme, so the same hobby reads the same
// everywhere (avatars, card media, calendar rows) in every theme and contrast level.
const tones: Record<string, [string, string]> = {
  guitar: ['primary-container', 'on-primary-container'],
  running: ['tertiary-container', 'on-tertiary-container'],
  painting: ['secondary-container', 'on-secondary-container'],
  reading: ['primary-fixed-dim', 'on-primary-fixed'],
  cooking: ['tertiary-fixed', 'on-tertiary-fixed'],
  photography: ['secondary-fixed', 'on-secondary-fixed'],
  yoga: ['tertiary-fixed-dim', 'on-tertiary-fixed'],
  gardening: ['secondary-fixed-dim', 'on-secondary-fixed'],
}

export function hobbyTone(id: string) {
  const [bg, fg] = tones[id] ?? tones.guitar
  return { background: `var(--md-sys-color-${bg})`, color: `var(--md-sys-color-${fg})` }
}
