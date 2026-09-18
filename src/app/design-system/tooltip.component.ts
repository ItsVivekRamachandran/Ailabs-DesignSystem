import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

@Component({
  selector: 'ds-tooltip',
  standalone: true,
  host: { class: 'ds-tooltip' },
  template: `
    <span class="ds-tooltip__trigger" [attr.aria-describedby]="tooltipId"><ng-content /></span>
    <span class="ds-tooltip__bubble ds-tooltip__bubble--{{ position }}" [class.ds-tooltip__bubble--visible]="visible" [id]="tooltipId" role="tooltip">{{ text }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  private static nextId = 0
  @Input() text = ''
  @Input() position: TooltipPosition = 'top'
  @Input() visible = false
  readonly tooltipId = `ds-tooltip-${++TooltipComponent.nextId}`
}
