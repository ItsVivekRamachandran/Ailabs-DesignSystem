import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

let nextInputId = 0

@Component({
  selector: 'ds-input, ds-text-field',
  standalone: true,
  host: { class: 'ds-field' },
  template: `
    @if (label) { <label class="ds-field__label" [class.ds-field__label--error]="error" [for]="inputId">{{ label }}</label> }
    <span class="ds-input-wrap">
      @if (icon === 'search') {
        <svg class="ds-input__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>
        </svg>
      }
      <input class="ds-input" [class.ds-input--error]="error" [id]="inputId" [type]="type" [placeholder]="placeholder" [value]="value" [disabled]="disabled" [attr.aria-invalid]="error ? 'true' : null" [attr.aria-describedby]="hint || error ? inputId + '-hint' : null" (input)="onInput($event)" />
    </span>
    @if (error || hint) { <span class="ds-field__hint" [class.ds-field__hint--error]="error" [id]="inputId + '-hint'">{{ error || hint }}</span> }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  @Input() label = ''
  @Input() hint = ''
  @Input() placeholder = ''
  @Input() type = 'text'
  @Input() icon = ''
  @Input() value = ''
  @Input() error = ''
  @Input() disabled = false
  @Output() readonly valueChange = new EventEmitter<string>()
  readonly inputId = `ds-input-${++nextInputId}`

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value
    this.valueChange.emit(this.value)
  }
}
