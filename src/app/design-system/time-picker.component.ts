import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core'
import { IconComponent } from './icon.component'
import { isBackdropClick } from './overlay'
import { centerDialog, containDialogFocus } from './picker-utils'
export type ClockMode = 'dial' | 'input'
export type ClockView = 'hours' | 'minutes'
export type HourCycle = 12 | 24
let nextClockId = 0
@Component({
  selector: 'ds-time-clock', standalone: true, host: { class: 'ds-time-clock' },
  template: `
    <div class="ds-time-clock__body" [class.is-input]="mode === 'input'" [class.is-24h]="hourCycle === 24">
      <span class="ds-time-clock__eyebrow">{{ mode === 'input' ? 'Enter time' : 'Select time' }}</span>
      <div class="ds-time-clock__selectors">
        <div class="ds-time-clock__display">
          <div class="ds-time-clock__unit">
            @if (mode === 'input') { <input #hourInput type="text" inputmode="numeric" maxlength="2" aria-label="Hour" [attr.aria-invalid]="error && !validHour ? 'true' : null" [attr.aria-describedby]="error ? clockId + '-error' : null" [value]="hour" (focus)="selectText($event)" (input)="setNumeric('hours', $event)" (keydown)="inputKey('hours', $event)" /> }
            @else { <button type="button" aria-label="Select hours" [attr.aria-pressed]="view === 'hours'" [class.is-active]="view === 'hours'" (click)="setView('hours')">{{ hour }}</button> }
            @if (mode === 'input') { <span>Hour</span> }
          </div>
          <strong aria-hidden="true">:</strong>
          <div class="ds-time-clock__unit">
            @if (mode === 'input') { <input type="text" inputmode="numeric" maxlength="2" aria-label="Minute" [attr.aria-invalid]="error && !validMinute ? 'true' : null" [attr.aria-describedby]="error ? clockId + '-error' : null" [value]="minute" (focus)="selectText($event)" (input)="setNumeric('minutes', $event)" (keydown)="inputKey('minutes', $event)" /> }
            @else { <button type="button" aria-label="Select minutes" [attr.aria-pressed]="view === 'minutes'" [class.is-active]="view === 'minutes'" (click)="setView('minutes')">{{ minute }}</button> }
            @if (mode === 'input') { <span>Minute</span> }
          </div>
        </div>
        @if (hourCycle === 12) {
          <div class="ds-time-clock__period" role="radiogroup" aria-label="AM or PM">
            @for (p of periods; track p) { <button type="button" role="radio" [attr.aria-checked]="period === p" [attr.tabindex]="period === p ? 0 : -1" [class.is-active]="period === p" (click)="setPeriod(p)" (keydown)="periodKey($event)">{{ p }}</button> }
          </div>
        }
      </div>
      @if (error) { <span class="ds-time-clock__error" role="alert" [id]="clockId + '-error'">{{ error }}</span> }
      @if (mode === 'dial') {
        <div class="ds-time-clock__dial" [attr.aria-label]="view === 'hours' ? 'Select hour' : 'Select minute'" (pointerdown)="startDrag($event)" (pointermove)="drag($event)" (pointerup)="endDrag($event)" (pointercancel)="dragging = false">
          <span class="ds-time-clock__hand" [style.transform]="handRotation" aria-hidden="true"></span>
          <span class="ds-time-clock__center" aria-hidden="true"></span>
          <span class="ds-time-clock__handle" [style.left.%]="handle.x" [style.top.%]="handle.y" aria-hidden="true">@if (view === 'minutes' && +minute % 5 !== 0) { <span class="ds-time-clock__dot"></span> }</span>
          @for (item of dialItems; track item.label) {
            <button type="button" [attr.aria-label]="view === 'hours' ? item.label + ' hours of 12' : item.label + ' minutes of 60'" [attr.aria-pressed]="item.label === activeDialValue" [attr.tabindex]="item.label === activeDialValue || (view === 'minutes' && +minute % 5 !== 0 && item.label === '00') ? 0 : -1"
              [style.left.%]="item.x" [style.top.%]="item.y" [class.is-selected]="item.label === activeDialValue" (click)="selectDial(item.label)" (keydown)="dialKey($event)">{{ item.label }}</button>
          }
        </div>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeClockComponent {
  private readonly cdr = inject(ChangeDetectorRef)
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef)
  @Input() mode: ClockMode = 'dial'
  @Input() view: ClockView = 'hours'
  @Input() hour = '09'
  @Input() minute = '30'
  @Input() period: 'AM' | 'PM' = 'AM'
  @Input() hourCycle: HourCycle = 12
  @Input() error = ''
  @Output() readonly hourChange = new EventEmitter<string>()
  @Output() readonly minuteChange = new EventEmitter<string>()
  @Output() readonly periodChange = new EventEmitter<'AM' | 'PM'>()
  readonly periods = ['AM', 'PM'] as const
  readonly clockId = `ds-clock-${++nextClockId}`
  dragging = false
  get validHour(): boolean { return /^\d{1,2}$/.test(this.hour) && +this.hour >= (this.hourCycle === 12 ? 1 : 0) && +this.hour <= (this.hourCycle === 12 ? 12 : 23) }
  get validMinute(): boolean { return /^\d{1,2}$/.test(this.minute) && +this.minute < 60 }
  get handRotation(): string { return `rotate(${(this.view === 'hours' ? +this.hour * 30 : +this.minute * 6) - 90}deg)` }
  get handle(): { x: number; y: number } { const angle = (this.view === 'hours' ? +this.hour * 30 : +this.minute * 6) * Math.PI / 180 - Math.PI / 2; return { x: 50 + Math.cos(angle) * 40, y: 50 + Math.sin(angle) * 40 } }
  get dialItems(): readonly { label: string; x: number; y: number }[] {
    const labels = this.view === 'hours' ? ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] : ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
    return labels.map((label, index) => ({ label, x: 50 + Math.cos(index * Math.PI / 6 - Math.PI / 2) * 40, y: 50 + Math.sin(index * Math.PI / 6 - Math.PI / 2) * 40 }))
  }
  get activeDialValue(): string { return this.view === 'hours' ? String(+this.hour) : this.minute.padStart(2, '0') }
  reset(hour: string, minute: string, period: 'AM' | 'PM'): void { this.hour = hour; this.minute = minute; this.period = period; this.view = 'hours'; this.error = ''; this.cdr.markForCheck() }
  setView(view: ClockView): void { this.view = view }
  setPeriod(period: 'AM' | 'PM'): void { this.period = period; this.periodChange.emit(period) }
  periodKey(event: KeyboardEvent): void { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); this.setPeriod(this.period === 'AM' ? 'PM' : 'AM'); this.cdr.detectChanges(); this.element.nativeElement.querySelector<HTMLButtonElement>('[role="radio"][aria-checked="true"]')?.focus() } }
  selectText(event: FocusEvent): void { (event.target as HTMLInputElement).select() }
  setNumeric(view: ClockView, event: Event): void { const value = (event.target as HTMLInputElement).value; this.error = ''; if (view === 'hours') { this.hour = value; this.hourChange.emit(value) } else { this.minute = value; this.minuteChange.emit(value) } }
  inputKey(view: ClockView, event: KeyboardEvent): void {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault(); const min = view === 'hours' && this.hourCycle === 12 ? 1 : 0, max = view === 'minutes' ? 59 : this.hourCycle === 12 ? 12 : 23
    const value = +(view === 'hours' ? this.hour : this.minute); const next = ((value - min + (event.key === 'ArrowUp' ? 1 : -1) + max - min + 1) % (max - min + 1)) + min
    this.view = view; this.updateValue(next)
  }
  private updateValue(value: number): void { if (this.view === 'hours') { this.hour = String(value).padStart(2, '0'); this.hourChange.emit(this.hour) } else { this.minute = String(value).padStart(2, '0'); this.minuteChange.emit(this.minute) } }
  selectDial(value: string): void { const hours = this.view === 'hours'; this.updateValue(+value); if (hours) this.view = 'minutes'; this.focusDial() }
  private focusDial(): void { this.cdr.detectChanges(); this.element.nativeElement.querySelector<HTMLButtonElement>('.ds-time-clock__dial button[tabindex="0"]')?.focus() }
  dialKey(event: KeyboardEvent): void { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); const count = this.view === 'hours' ? 12 : 60, value = this.view === 'hours' ? +this.hour : +this.minute; const next = (value + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1) + count) % count; this.updateValue(this.view === 'hours' ? next || 12 : next); this.focusDial() }
  startDrag(event: PointerEvent): void { if ((event.target as HTMLElement).closest('button')) return; event.preventDefault(); this.dragging = true; (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); this.drag(event) }
  drag(event: PointerEvent): void { if (!this.dragging) return; const rect = (event.currentTarget as HTMLElement).getBoundingClientRect(); const angle = (Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2) * 180 / Math.PI + 450) % 360; const count = this.view === 'hours' ? 12 : 60; const value = Math.round(angle / 360 * count) % count; this.updateValue(this.view === 'hours' ? value || 12 : value) }
  endDrag(event: PointerEvent): void { if (!this.dragging) return; this.drag(event); this.dragging = false; if (this.view === 'hours') this.view = 'minutes'; this.focusDial() }
  validate(): boolean { this.error = !this.validHour ? `Enter an hour from ${this.hourCycle === 12 ? '1 to 12' : '0 to 23'}` : !this.validMinute ? 'Enter minutes from 00 to 59' : ''; this.cdr.detectChanges(); if (this.error) this.element.nativeElement.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus(); return !this.error }
}

let nextTimePickerId = 0
@Component({
  selector: 'ds-time-picker', standalone: true, imports: [TimeClockComponent, IconComponent], host: { class: 'ds-picker-field ds-material-field' },
  template: `
    <label class="ds-field__label" [for]="inputId">{{ label }}</label>
    <span class="ds-picker-field__control">
      <input #trigger [id]="inputId" [placeholder]="hourCycle === 24 ? 'HH : MM' : placeholder" [value]="value" [disabled]="disabled" [attr.aria-invalid]="error || inputError ? 'true' : null" [attr.aria-describedby]="inputId + '-hint'" (input)="onInput($event)" (blur)="finishTyping()" (click)="openPicker()" (keydown)="onKey($event)" />
      <button type="button" class="ds-picker-field__toggle ds-picker-icon" [disabled]="disabled" [attr.aria-label]="'Choose ' + label.toLowerCase()" aria-haspopup="dialog" [attr.aria-expanded]="opened" [attr.aria-controls]="inputId + '-panel'" (click)="openPicker()"><ds-icon name="schedule" /></button>
    </span>
    <span class="ds-field__hint" [class.ds-field__hint--error]="error || inputError" [id]="inputId + '-hint'">{{ error || inputError || (hourCycle === 24 ? '24-hour time · HH:MM' : '12-hour time · HH:MM AM/PM') }}</span>
    <dialog #panel class="ds-picker-overlay ds-time-overlay" [class.is-input]="mode === 'input'" [id]="inputId + '-panel'" [attr.aria-label]="label + ': ' + (mode === 'input' ? 'enter time' : 'select time')" (cancel)="closePicker($event)" (click)="onBackdrop($event)" (keydown)="panelKey($event)">
      <ds-time-clock [mode]="mode" [hourCycle]="hourCycle" />
      <div class="ds-picker-overlay__actions">
        @if (canShowDial) { <button type="button" class="ds-picker-icon" [attr.aria-label]="mode === 'dial' ? 'Switch to keyboard entry' : 'Switch to clock dial'" (click)="toggleMode()"><ds-icon [name]="mode === 'dial' ? 'keyboard' : 'schedule'" /></button> }
        <span class="ds-picker-action-spacer"></span><button type="button" class="ds-picker-text" (click)="closePicker()">Cancel</button><button type="button" class="ds-picker-text" (click)="apply()">OK</button>
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
  @Input() hourCycle: HourCycle = 12
  @Input() initialMode: ClockMode = 'dial'
  @Output() readonly valueChange = new EventEmitter<string>()
  @ViewChild(TimeClockComponent) clock!: TimeClockComponent
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLDialogElement>
  @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLInputElement>
  private readonly cdr = inject(ChangeDetectorRef)
  private returnFocus?: HTMLElement
  readonly inputId = `ds-time-picker-${++nextTimePickerId}`
  opened = false
  mode: ClockMode = 'dial'
  canShowDial = true
  inputError = ''
  private parse(value: string): { hour: string; minute: string; period: 'AM' | 'PM' } | null { const match = value.trim().match(/^(\d{1,2})\s*[:.]\s*(\d{1,2})\s*(AM|PM)?$/i); if (!match || +match[2] > 59 || +match[1] < (this.hourCycle === 12 ? 1 : 0) || +match[1] > (this.hourCycle === 12 ? 12 : 23) || this.hourCycle === 24 && match[3]) return null; return { hour: match[1].padStart(2, '0'), minute: match[2].padStart(2, '0'), period: match[3]?.toUpperCase() === 'PM' ? 'PM' : 'AM' } }
  onInput(event: Event): void { this.value = (event.target as HTMLInputElement).value; this.inputError = '' }
  finishTyping(): void { if (!this.value.trim()) { this.valueChange.emit(''); return } const time = this.parse(this.value); if (!time) { this.inputError = 'Enter a valid time'; return } this.value = `${time.hour} : ${time.minute}${this.hourCycle === 12 ? ' ' + time.period : ''}`; this.valueChange.emit(this.value) }
  onKey(event: KeyboardEvent): void { if (event.altKey && event.key === 'ArrowDown') { event.preventDefault(); this.openPicker() } else if (event.key === 'Enter') { event.preventDefault(); this.finishTyping() } }
  openPicker(): void { if (this.disabled || this.opened) return; this.returnFocus = document.activeElement as HTMLElement; const time = this.parse(this.value) || { hour: '09', minute: '00', period: 'AM' as const }; this.canShowDial = window.innerHeight >= 620 && window.innerWidth >= 360 && this.hourCycle === 12; this.mode = this.canShowDial ? this.initialMode : 'input'; this.clock.reset(time.hour, time.minute, time.period); this.opened = true; this.cdr.detectChanges(); this.panel.nativeElement.showModal(); this.reposition(); if (this.mode === 'input') this.panel.nativeElement.querySelector<HTMLInputElement>('input')?.focus() }
  toggleMode(): void { if (this.mode === 'input' && !this.clock.validate()) return; this.mode = this.mode === 'dial' ? 'input' : 'dial'; this.cdr.detectChanges(); this.reposition(); this.panel.nativeElement.querySelector<HTMLElement>(this.mode === 'input' ? 'input' : '[aria-label="Select hours"]')?.focus() }
  panelKey(event: KeyboardEvent): void { containDialogFocus(this.panel.nativeElement, event); if (event.key === 'Enter' && (event.target as HTMLElement).tagName === 'INPUT') { event.preventDefault(); this.apply() } }
  apply(): void { if (!this.clock.validate()) return; this.value = `${this.clock.hour.padStart(2, '0')} : ${this.clock.minute.padStart(2, '0')}${this.hourCycle === 12 ? ' ' + this.clock.period : ''}`; this.inputError = ''; this.valueChange.emit(this.value); this.closePicker() }
  closePicker(event?: Event): void { event?.preventDefault(); if (!this.opened) return; this.opened = false; this.panel.nativeElement.close(); (this.returnFocus?.isConnected ? this.returnFocus : this.trigger.nativeElement).focus(); this.cdr.markForCheck() }
  onBackdrop(event: MouseEvent): void { if (isBackdropClick(event, this.panel.nativeElement)) this.closePicker() }
  @HostListener('window:resize') reposition(): void { if (!this.opened) return; this.canShowDial = window.innerHeight >= 620 && window.innerWidth >= 360 && this.hourCycle === 12; if (!this.canShowDial && this.mode === 'dial') { this.mode = 'input'; this.cdr.detectChanges() } centerDialog(this.panel.nativeElement) }
}
