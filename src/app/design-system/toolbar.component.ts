import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

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
export class ToolbarComponent {
  @Input() variant: ToolbarVariant = 'docked'
  @Input() tone: ToolbarTone = 'standard'
  @Input() expanded = true
  @Input() ariaLabel = 'Page actions'

  @HostBinding('class')
  get classes(): string {
    return `ds-toolbar ds-toolbar--${this.variant} ds-toolbar--${this.tone}${this.expanded ? ' ds-toolbar--expanded' : ' ds-toolbar--collapsed'}`
  }
}
