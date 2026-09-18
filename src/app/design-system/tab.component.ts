import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'button[dsTab]',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  @Input() active = false

  @HostBinding('class')
  get classes(): string {
    return `ds-tab${this.active ? ' ds-tab--active' : ''}`
  }

  @HostBinding('attr.role') readonly role = 'tab'

  @HostBinding('attr.aria-selected')
  get selected(): string {
    return String(this.active)
  }
}
