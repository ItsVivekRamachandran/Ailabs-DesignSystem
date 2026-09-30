import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { ButtonComponent } from './button.component'

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error'

/** Persistent inline feedback. The consumer owns dismissal and focus restoration. */
@Component({
  selector: 'ds-alert',
  standalone: true,
  imports: [ButtonComponent],
  host: { class: 'ds-alert' },
  template: `
    <div class="ds-alert__surface ds-alert--{{ severity }}">
      <div class="ds-alert__message" [attr.role]="announcement === 'assertive' ? 'alert' : announcement === 'polite' ? 'status' : null" aria-atomic="true">
        <span class="ds-alert__icon" aria-hidden="true">{{ symbols[severity] }}</span>
        <div class="ds-alert__content"><strong>{{ heading || labels[severity] }}</strong><div><ng-content /></div></div>
      </div>
      @if (actionLabel || dismissible) {
        <div class="ds-alert__actions">
          @if (actionLabel) { <button dsButton variant="outline" (click)="action.emit()">{{ actionLabel }}</button> }
          @if (dismissible) { <button dsButton variant="ghost" [iconOnly]="true" [attr.aria-label]="dismissLabel" (click)="dismiss.emit()"><span aria-hidden="true">×</span></button> }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  @Input() severity: AlertSeverity = 'info'
  @Input() heading = ''
  @Input() actionLabel = ''
  @Input() dismissible = false
  @Input() dismissLabel = 'Dismiss notification'
  @Input() announcement: 'off' | 'polite' | 'assertive' = 'off'
  @Output() readonly action = new EventEmitter<void>()
  @Output() readonly dismiss = new EventEmitter<void>()
  readonly symbols = { info: 'i', success: '✓', warning: '!', error: '×' }
  readonly labels = { info: 'Information', success: 'Success', warning: 'Warning', error: 'Error' }
}
