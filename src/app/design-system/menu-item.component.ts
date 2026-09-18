import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'button[dsMenuItem]',
  standalone: true,
  template: '<span><ng-content /></span>@if (shortcut) { <kbd>{{ shortcut }}</kbd> }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  @Input() shortcut = ''
  @Input() active = false

  @HostBinding('class')
  get classes(): string {
    return `ds-menu-item${this.active ? ' ds-menu-item--active' : ''}`
  }

  @HostBinding('attr.role') readonly role = 'menuitem'
}
