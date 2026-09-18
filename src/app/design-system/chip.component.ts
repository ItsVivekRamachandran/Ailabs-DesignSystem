import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

export type ChipVariant = 'filled' | 'outlined'

@Component({
  selector: 'button[dsChip]',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  @Input() variant: ChipVariant = 'filled'
  @Input() selected = false
  @Input() iconOnly = false

  @HostBinding('class')
  get classes(): string {
    return `ds-chip ds-chip--${this.variant}${this.selected ? ' ds-chip--selected' : ''}${this.iconOnly ? ' ds-chip--icon-only' : ''}`
  }
}
