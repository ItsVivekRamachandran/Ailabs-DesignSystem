import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

let nextRadioId = 0

@Component({
  selector: 'ds-radio',
  standalone: true,
  host: { class: 'ds-radio' },
  template: `
    <label class="ds-radio__label" [class.ds-radio__label--disabled]="disabled" [for]="inputId">
      <input class="ds-radio__input" [id]="inputId" type="radio" [name]="name" [value]="value" [checked]="checked" [disabled]="disabled" (change)="select()" />
      <span class="ds-radio__circle" aria-hidden="true"><span></span></span>
      <span><ng-content /></span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent {
  @Input() name = `ds-radio-group-${nextRadioId + 1}`
  @Input() value = ''
  @Input() checked = false
  @Input() disabled = false
  @Output() readonly checkedChange = new EventEmitter<boolean>()
  readonly inputId = `ds-radio-${++nextRadioId}`

  select(): void {
    this.checked = true
    this.checkedChange.emit(true)
  }
}
