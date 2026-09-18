import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

let nextTimePickerId = 0

@Component({
  selector: 'ds-time-picker',
  standalone: true,
  host: { class: 'ds-picker-field' },
  template: `
    <label class="ds-field__label" [class.ds-field__label--error]="error" [for]="inputId">{{ label }}</label>
    <span class="ds-picker-field__control">
      <input [id]="inputId" inputmode="numeric" [placeholder]="placeholder" [value]="value" [disabled]="disabled" [attr.aria-invalid]="error ? 'true' : null" [attr.aria-describedby]="error ? inputId + '-error' : null" (input)="onInput($event)" />
      <span class="ds-picker-field__clock-icon" aria-hidden="true"><span></span></span>
    </span>
    @if (error) { <span class="ds-field__hint ds-field__hint--error" [id]="inputId + '-error'">{{ error }}</span> }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimePickerComponent {
  @Input() label = 'Label'
  @Input() placeholder = 'HH : MM'
  @Input() value = ''
  @Input() error = ''
  @Input() disabled = false
  @Output() readonly valueChange = new EventEmitter<string>()
  readonly inputId = `ds-time-picker-${++nextTimePickerId}`

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value
    this.valueChange.emit(this.value)
  }
}

export type ClockMode = 'dial' | 'input'
export type ClockView = 'hours' | 'minutes'

@Component({
  selector: 'ds-time-clock',
  standalone: true,
  host: { class: 'ds-time-clock' },
  template: `
    <div class="ds-time-clock__body">
      <span class="ds-time-clock__eyebrow">Select time</span>
      <div class="ds-time-clock__display">
        <button type="button" [class.ds-time-clock__value--active]="view === 'hours'" [class.ds-time-clock__value--error]="error && view === 'hours'" (click)="view = 'hours'">{{ hour }}</button>
        <strong>:</strong>
        <button type="button" [class.ds-time-clock__value--active]="view === 'minutes'" (click)="view = 'minutes'">{{ minute }}</button>
      </div>
      @if (error) { <span class="ds-time-clock__error">{{ error }}</span> }
      @if (mode === 'dial') {
        <div class="ds-time-clock__dial">
          <span class="ds-time-clock__hand" [class.ds-time-clock__hand--minutes]="view === 'minutes'"></span>
          @for (item of dialItems; track item.label) {
            <button type="button" [style.left.%]="item.x" [style.top.%]="item.y" [class.ds-time-clock__number--selected]="item.label === activeDialValue" (click)="selectDial(item.label)">{{ item.label }}</button>
          }
        </div>
      } @else {
        <div class="ds-time-clock__labels"><span>Hour</span><span>Minute</span></div>
      }
      <div class="ds-time-clock__period"><button type="button" [class.is-active]="period === 'AM'" (click)="period = 'AM'">AM</button><button type="button" [class.is-active]="period === 'PM'" (click)="period = 'PM'">PM</button></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeClockComponent {
  @Input() mode: ClockMode = 'dial'
  @Input() view: ClockView = 'hours'
  @Input() hour = '09'
  @Input() minute = '30'
  @Input() period: 'AM' | 'PM' = 'AM'
  @Input() error = ''

  get dialItems(): readonly { label: string; x: number; y: number }[] {
    const labels = this.view === 'hours' ? ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] : ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
    return labels.map((label, index) => {
      const angle = (index * Math.PI) / 6 - Math.PI / 2
      return { label, x: 50 + Math.cos(angle) * 39, y: 50 + Math.sin(angle) * 39 }
    })
  }

  get activeDialValue(): string {
    return this.view === 'hours' ? String(Number(this.hour)) : this.minute
  }

  selectDial(value: string): void {
    if (this.view === 'hours') this.hour = value.padStart(2, '0')
    else this.minute = value.padStart(2, '0')
  }
}
