import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core'
import { isBackdropClick, positionOverlay } from './overlay'
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
      @if (mode === 'input') {
        <input type="number" min="1" max="12" aria-label="Hour" [value]="hour" (change)="setNumeric('hours', $event)" /><strong>:</strong>
        <input type="number" min="0" max="59" aria-label="Minute" [value]="minute" (change)="setNumeric('minutes', $event)" />
      } @else {
        <button type="button" aria-label="Select hours" [class.ds-time-clock__value--active]="view === 'hours'" [class.ds-time-clock__value--error]="error && view === 'hours'" (click)="view = 'hours'">{{ hour }}</button>
        <strong>:</strong>
        <button type="button" aria-label="Select minutes" [class.ds-time-clock__value--active]="view === 'minutes'" (click)="view = 'minutes'">{{ minute }}</button>
      }
      </div>
      @if (error) { <span class="ds-time-clock__error">{{ error }}</span> }
      @if (mode === 'dial') {
        <div class="ds-time-clock__dial">
          <span class="ds-time-clock__hand" [style.transform]="handRotation"></span>
          @for (item of dialItems; track item.label) {
            <button type="button" [attr.aria-label]="item.label + (view === 'hours' ? ' hours' : ' minutes')" [attr.aria-pressed]="item.label === activeDialValue" [style.left.%]="item.x" [style.top.%]="item.y" [class.ds-time-clock__number--selected]="item.label === activeDialValue" (click)="selectDial(item.label)">{{ item.label }}</button>
          }
        </div>
      } @else {
        <div class="ds-time-clock__labels"><span>Hour</span><span>Minute</span></div>
      }
      <div class="ds-time-clock__period"><button type="button" [class.is-active]="period === 'AM'" [attr.aria-pressed]="period === 'AM'" (click)="setPeriod('AM')">AM</button><button type="button" [class.is-active]="period === 'PM'" [attr.aria-pressed]="period === 'PM'" (click)="setPeriod('PM')">PM</button></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeClockComponent {
  private readonly changeDetector = inject(ChangeDetectorRef)
  resetView(): void { this.view = 'hours'; this.changeDetector.markForCheck() }
  @Input() mode: ClockMode = 'dial'
  @Input() view: ClockView = 'hours'
  @Input() hour = '09'
  @Input() minute = '30'
  @Input() period: 'AM' | 'PM' = 'AM'
  @Output() readonly hourChange = new EventEmitter<string>()
  @Output() readonly minuteChange = new EventEmitter<string>()
  @Output() readonly periodChange = new EventEmitter<'AM' | 'PM'>()
  get handRotation(): string { return `rotate(${(this.view === 'hours' ? Number(this.hour) * 30 : Number(this.minute) * 6) - 90}deg)` }
  setPeriod(period: 'AM' | 'PM'): void { this.period = period; this.periodChange.emit(period) }
  setNumeric(view: ClockView, event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.value || !input.validity.valid) return
    this.view = view; this.selectDial(input.value)
  }
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
    if (this.view === 'hours') { this.hour = value.padStart(2, '0'); this.hourChange.emit(this.hour) }
    else { this.minute = value.padStart(2, '0'); this.minuteChange.emit(this.minute) }
  }
}

let nextTimePickerId = 0
@Component({
  selector: 'ds-time-picker', standalone: true, imports: [TimeClockComponent], host: { class: 'ds-picker-field' },
  template: `
    <label class="ds-field__label" [class.ds-field__label--error]="error" [for]="inputId">{{ label }}</label>
    <span class="ds-picker-field__control">
      <input #trigger [id]="inputId" [placeholder]="placeholder" [value]="value" [disabled]="disabled"
        role="combobox" aria-haspopup="dialog" aria-autocomplete="none" [attr.aria-expanded]="opened" [attr.aria-controls]="inputId + '-panel'"
        [attr.aria-invalid]="error ? 'true' : null" [attr.aria-describedby]="error ? inputId + '-error' : null"
        (input)="onInput($event)" (click)="openPicker()" (keydown)="onKey($event)" />
      <span class="ds-picker-field__clock-icon" aria-hidden="true"><span></span></span>
    </span>
    @if (error) { <span class="ds-field__hint ds-field__hint--error" [id]="inputId + '-error'">{{ error }}</span> }
    <dialog #panel class="ds-picker-overlay" [id]="inputId + '-panel'" [attr.aria-label]="label + ': select time'"
      (cancel)="closePicker($event)" (click)="onBackdrop($event)" (close)="onClosed()">
      <ds-time-clock [mode]="mode" [hour]="hour" [minute]="minute" [period]="period" (hourChange)="hour = $event" (minuteChange)="minute = $event" (periodChange)="period = $event" />
      <div class="ds-picker-overlay__actions">
        <button type="button" class="ds-button ds-button--ghost" (click)="toggleMode()" [attr.aria-label]="mode === 'dial' ? 'Switch to keyboard entry' : 'Switch to clock dial'">{{ mode === 'dial' ? 'Keyboard' : 'Clock' }}</button>
        <button type="button" class="ds-button ds-button--ghost" (click)="closePicker()">Cancel</button>
        <button type="button" class="ds-button" (click)="apply()">Apply</button>
      </div>
    </dialog>
  `, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimePickerComponent {
  @Input() label = 'Time'
  @Input() placeholder = 'HH : MM AM'
  @Input() value = ''
  @Input() error = ''
  @Input() disabled = false
  @Output() readonly valueChange = new EventEmitter<string>()
  @ViewChild(TimeClockComponent) clock!: TimeClockComponent
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLDialogElement>
  @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLInputElement>
  private readonly changeDetector = inject(ChangeDetectorRef)
  readonly inputId = `ds-time-picker-${++nextTimePickerId}`
  opened = false
  mode: ClockMode = 'dial'
  hour = '09'
  minute = '00'
  period: 'AM' | 'PM' = 'AM'
  onInput(event: Event): void { this.value = (event.target as HTMLInputElement).value; this.valueChange.emit(this.value) }
  onKey(event: KeyboardEvent): void { if (event.key === 'ArrowDown' || event.key === 'Enter') { event.preventDefault(); this.openPicker() } }
  openPicker(): void {
    if (this.disabled || this.opened) return
    const match = this.value.match(/^(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)?$/i)
    const valid = match && +match[1] >= 1 && +match[1] <= 12 && +match[2] < 60
    this.hour = valid ? match[1].padStart(2, '0') : '09'; this.minute = valid ? match[2] : '00'
    this.period = valid && match[3]?.toUpperCase() === 'PM' ? 'PM' : 'AM'
    this.clock.resetView(); this.mode = 'dial'; this.opened = true; this.changeDetector.detectChanges()
    this.panel.nativeElement.showModal(); this.reposition()
  }
  toggleMode(): void {
    this.mode = this.mode === 'dial' ? 'input' : 'dial'; this.changeDetector.detectChanges(); this.reposition()
    this.panel.nativeElement.querySelector<HTMLElement>(this.mode === 'input' ? 'input' : '[aria-label="Select hours"]')?.focus()
  }
  apply(): void {
    const invalid = Array.from(this.panel.nativeElement.querySelectorAll<HTMLInputElement>('input')).find(input => !input.value || !input.checkValidity())
    if (invalid) { invalid.reportValidity(); invalid.focus(); return }
    this.value = `${this.hour} : ${this.minute} ${this.period}`; this.valueChange.emit(this.value); this.closePicker()
  }
  closePicker(event?: Event): void { event?.preventDefault(); this.opened = false; this.panel.nativeElement.close(); this.trigger.nativeElement.focus() }
  onClosed(): void { this.opened = false }
  onBackdrop(event: MouseEvent): void { if (isBackdropClick(event, this.panel.nativeElement)) this.closePicker() }
  @HostListener('window:resize') reposition(): void { if (this.opened) positionOverlay(this.panel.nativeElement, this.trigger.nativeElement, true) }
}
