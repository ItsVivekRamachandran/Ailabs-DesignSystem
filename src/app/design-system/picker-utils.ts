/** Local calendar dates; avoid UTC parsing and rollover of impossible dates. */
export function parseDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{1,4})[\s./-]+(\d{1,2})[\s./-]+(\d{1,4})$/)
  if (!match) return null
  const yearFirst = match[1].length === 4
  const year = Number(yearFirst ? match[1] : match[3]), month = Number(yearFirst ? match[2] : match[1]), day = Number(yearFirst ? match[3] : match[2])
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(0); date.setHours(0, 0, 0, 0); date.setFullYear(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}
export function formatDate(date: Date): string { return `${String(date.getMonth() + 1).padStart(2, '0')} / ${String(date.getDate()).padStart(2, '0')} / ${String(date.getFullYear()).padStart(4, '0')}` }
export function sameDate(a: Date | null, b: Date): boolean { return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
export function centerDialog(panel: HTMLElement): void { const rect = panel.getBoundingClientRect(); panel.style.left = `${Math.max(0, (window.innerWidth - rect.width) / 2)}px`; panel.style.top = `${Math.max(0, (window.innerHeight - rect.height) / 2)}px` }
/** Keep Tab/Shift+Tab within a modal, including Chromium's browser-chrome boundary. */
export function containDialogFocus(panel: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return
  const controls = Array.from(panel.querySelectorAll<HTMLElement>('button, input, [tabindex]')).filter(el => el.tabIndex >= 0 && !el.hasAttribute('disabled') && el.getClientRects().length > 0)
  const first = controls[0], last = controls.at(-1)
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
