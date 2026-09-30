import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, Input, inject } from '@angular/core'

@Component({ selector: 'button[dsTab]', standalone: true, template: '<ng-content />', changeDetection: ChangeDetectionStrategy.OnPush })
export class TabComponent {
  private readonly host = inject<ElementRef<HTMLButtonElement>>(ElementRef)
  @Input() @HostBinding('attr.type') type = 'button'
  @Input() active = false
  @Input() @HostBinding('attr.aria-controls') panelId: string | null = null
  @HostBinding('class') get classes(): string { return `ds-tab${this.active ? ' ds-tab--active' : ''}` }
  @HostBinding('attr.role') readonly role = 'tab'
  @HostBinding('attr.aria-selected') get selected(): string { return String(this.active) }
  @HostBinding('attr.tabindex') get tabIndex(): number { return this.active ? 0 : -1 }

  @HostListener('keydown', ['$event']) navigate(event: KeyboardEvent): void {
    const group = this.host.nativeElement.closest('[role="tablist"]')
    if (!group) return
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('button[dsTab]:not(:disabled)'))
    const vertical = group.getAttribute('aria-orientation') === 'vertical'
    const forward = vertical ? 'ArrowDown' : 'ArrowRight'
    const backward = vertical ? 'ArrowUp' : 'ArrowLeft'
    if (!['Home', 'End', forward, backward].includes(event.key)) return
    event.preventDefault()
    const index = tabs.indexOf(this.host.nativeElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === forward ? 1 : -1) + tabs.length) % tabs.length
    tabs[next]?.focus() // Manual activation: Enter/Space invokes the consumer's click handler.
  }
}
