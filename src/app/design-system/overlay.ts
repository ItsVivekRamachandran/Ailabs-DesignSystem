/** Position a top-layer panel without clipping it to a card or scrolling container. */
export function positionOverlay(panel: HTMLElement, trigger: HTMLElement, centerOnMobile = false): void {
  const anchor = trigger.getBoundingClientRect()
  const width = panel.getBoundingClientRect().width
  const height = panel.getBoundingClientRect().height
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const centered = centerOnMobile && viewportWidth < 520
  const below = anchor.bottom + 8
  const top = centered ? (viewportHeight - height) / 2 : below + height <= viewportHeight - 12 ? below : anchor.top - height - 8
  panel.style.left = `${Math.max(12, Math.min(centered ? (viewportWidth - width) / 2 : anchor.left, viewportWidth - width - 12))}px`
  panel.style.top = `${Math.max(12, Math.min(top, viewportHeight - height - 12))}px`
}

export function isBackdropClick(event: MouseEvent, panel: HTMLElement): boolean {
  if (event.target !== panel) return false
  const rect = panel.getBoundingClientRect()
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
}
