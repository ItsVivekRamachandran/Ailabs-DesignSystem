import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'ds-card',
  standalone: true,
  host: { class: 'ds-card' },
  template: `
    @if (eyebrow || title || description) {
      <header class="ds-card__header">
        <div>
          @if (eyebrow) { <p class="ds-card__eyebrow">{{ eyebrow }}</p> }
          @if (title) { <h3 class="ds-card__title">{{ title }}</h3> }
          @if (description) { <p class="ds-card__description">{{ description }}</p> }
        </div>
      </header>
    }
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() eyebrow = ''
  @Input() title = ''
  @Input() description = ''
}
