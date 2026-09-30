import { AfterContentInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnDestroy, inject } from '@angular/core'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

@Component({
  selector: 'ds-tooltip', standalone: true,
  host: { class: 'ds-tooltip', '[class.ds-tooltip--dismissed]': 'dismissed' },
  template: `
    <span class="ds-tooltip__trigger"><ng-content /></span>
    <span class="ds-tooltip__bubble ds-tooltip__bubble--{{ position }}" [class.ds-tooltip__bubble--visible]="visible && !dismissed" [id]="tooltipId" role="tooltip">{{ text }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent implements AfterContentInit, OnDestroy {
  private static nextId = 0
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
  private trigger?: HTMLElement
  @Input() text = ''
  @Input() position: TooltipPosition = 'top'
  @Input() visible = false
  dismissed = false
  readonly tooltipId = `ds-tooltip-${++TooltipComponent.nextId}`

  ngAfterContentInit(): void {
    this.trigger = this.host.nativeElement.querySelector<HTMLElement>('button, a[href], input, [tabindex]') ?? undefined
    if (this.trigger) this.trigger.setAttribute('aria-describedby', [this.trigger.getAttribute('aria-describedby'), this.tooltipId].filter(Boolean).join(' '))
  }
  @HostListener('keydown.escape', ['$event']) close(event: Event): void { this.dismissed = true; event.stopPropagation() }
  @HostListener('mouseenter') @HostListener('focusin') reopen(): void { this.dismissed = false }
  ngOnDestroy(): void {
    if (!this.trigger) return
    const ids = (this.trigger.getAttribute('aria-describedby') ?? '').split(' ').filter(id => id && id !== this.tooltipId)
    if (ids.length) this.trigger.setAttribute('aria-describedby', ids.join(' '))
    else this.trigger.removeAttribute('aria-describedby')
  }
}
