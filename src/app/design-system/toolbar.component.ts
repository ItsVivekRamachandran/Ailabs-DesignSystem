import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, Input, inject } from '@angular/core'

export type ToolbarVariant = 'docked' | 'floating-horizontal' | 'floating-vertical'
export type ToolbarTone = 'standard' | 'vibrant'

@Component({
  selector: 'ds-toolbar',
  standalone: true,
  template: `
    <div
      class="ds-toolbar__container"
      role="toolbar"
      [attr.aria-label]="ariaLabel"
      [attr.aria-orientation]="variant === 'floating-vertical' ? 'vertical' : 'horizontal'"
    >
      @if (variant === 'docked' || expanded) {
        <span class="ds-toolbar__group ds-toolbar__group--leading"><ng-content select="[toolbarLeading]" /></span>
      }
      <span class="ds-toolbar__group ds-toolbar__group--primary"><ng-content /></span>
      @if (variant === 'docked' || expanded) {
        <span class="ds-toolbar__group ds-toolbar__group--trailing"><ng-content select="[toolbarTrailing]" /></span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements AfterViewChecked {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
  private current?: HTMLButtonElement
  private controls(): HTMLButtonElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')).filter(button => !button.hidden && !button.closest('[hidden]'))
  }
  ngAfterViewChecked(): void {
    const buttons = this.controls()
    if (!this.current || !buttons.includes(this.current)) this.current = buttons[0]
    buttons.forEach(button => button.tabIndex = button === this.current ? 0 : -1)
  }
  @HostListener('focusin', ['$event']) onFocus(event: FocusEvent): void {
    const target = event.target as HTMLButtonElement
    if (this.controls().includes(target)) this.current = target
  }
  @HostListener('keydown', ['$event']) navigate(event: KeyboardEvent): void {
    const buttons = this.controls()
    const index = buttons.indexOf(event.target as HTMLButtonElement)
    if (index < 0) return
    const nextKey = this.variant === 'floating-vertical' ? 'ArrowDown' : 'ArrowRight'
    const previousKey = this.variant === 'floating-vertical' ? 'ArrowUp' : 'ArrowLeft'
    if (!['Home', 'End', nextKey, previousKey].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === nextKey ? 1 : -1) + buttons.length) % buttons.length
    this.current = buttons[next]
    this.ngAfterViewChecked()
    this.current?.focus()
  }

  @Input() variant: ToolbarVariant = 'docked'
  @Input() tone: ToolbarTone = 'standard'
  @Input() expanded = true
  @Input() ariaLabel = 'Page actions'

  @HostBinding('class')
  get classes(): string {
    return `ds-toolbar ds-toolbar--${this.variant} ds-toolbar--${this.tone}${this.expanded ? ' ds-toolbar--expanded' : ' ds-toolbar--collapsed'}`
  }
}
