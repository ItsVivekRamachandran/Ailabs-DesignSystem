import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'button[dsMenuItem]',
  standalone: true,
  template: '<span><ng-content /></span>@if (shortcut) { <kbd>{{ shortcut }}</kbd> }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  @Input() @HostBinding("attr.type") type = "button"
  @Input() shortcut = ''
  @Input() active = false

  @HostBinding('class')
  get classes(): string {
    return `ds-menu-item${this.active ? ' ds-menu-item--active' : ''}`
  }

  // Standalone command buttons retain native semantics. Set role=menuitem only inside a managed menu.
  @Input() @HostBinding('attr.role') role: string | null = null
}
