import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

export type BadgeTone = 'neutral' | 'violet' | 'success' | 'warning'

@Component({
  selector: 'ds-badge',
  standalone: true,
  template: `
    @if (dot) { <span class="ds-badge__dot" aria-hidden="true"></span> }
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral'
  @Input() dot = false

  @HostBinding('class')
  get classes(): string {
    return `ds-badge ds-badge--${this.tone}`
  }
}
