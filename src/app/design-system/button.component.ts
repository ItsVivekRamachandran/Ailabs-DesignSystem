import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

@Component({
  selector: 'button[dsButton]',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary'
  @Input() size: ButtonSize = 'md'
  @Input() iconOnly = false

  @HostBinding('class')
  get classes(): string {
    return `ds-button ds-button--${this.variant} ds-button--${this.size}${this.iconOnly ? ' ds-button--icon-only' : ''}`
  }
}
