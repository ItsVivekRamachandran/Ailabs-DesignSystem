import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'button[dsListItem]',
  standalone: true,
  template: `
    <span class="ds-list-item__avatar" aria-hidden="true"><ng-content select="[avatar]" /></span>
    <span class="ds-list-item__content">
      <span class="ds-list-item__title">{{ title }}<ng-content select="[title]" /></span>
      @if (supportingText) { <span class="ds-list-item__supporting">{{ supportingText }}</span> }
    </span>
    <span class="ds-list-item__trailing"><ng-content select="[trailing]" /></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  @Input() title = ''
  @Input() supportingText = ''
  @Input() selected = false

  @HostBinding('class')
  get classes(): string {
    return `ds-list-item${this.supportingText ? ' ds-list-item--two-line' : ''}${this.selected ? ' ds-list-item--selected' : ''}`
  }
}
