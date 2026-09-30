import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core'
import { isBackdropClick, positionOverlay } from './overlay'
export type CalendarView = 'calendar' | 'months' | 'years'

interface CalendarDay {
  readonly label: number
  readonly muted?: boolean
  readonly date: Date
}

@Component({
  selector: 'ds-date-calendar',
  standalone: true,
  host: { class: 'ds-date-calendar' },
  template: `
    <header class="ds-picker-panel__header"><span>Select date</span><strong>{{ selectedDateLabel }}</strong></header>
    <div class="ds-date-calendar__body">
      <div class="ds-date-calendar__toolbar">
        <button type="button" (click)="cycleView()">{{ view === 'years' ? selectedYear : months[selectedMonth] + ' ' + selectedYear }} <span aria-hidden="true">↓</span></button>
        @if (view === 'calendar') {
          <span><button type="button" aria-label="Previous month" (click)="moveMonth(-1)">‹</button><button type="button" aria-label="Next month" (click)="moveMonth(1)">›</button></span>
        }
      </div>
      @if (view === 'calendar') {
        <div class="ds-date-calendar__weekdays">@for (day of weekdays; track $index) { <span>{{ day }}</span> }</div>
        <div class="ds-date-calendar__days" (keydown)="navigateDays($event)">
          @for (day of days; track $index) {
            <button type="button" [attr.aria-label]="day.date.toDateString()" [attr.tabindex]="day.label === selectedDay && !day.muted ? 0 : -1" [attr.aria-pressed]="day.label === selectedDay && !day.muted" [class.ds-date-calendar__day--muted]="day.muted" [class.ds-date-calendar__day--selected]="day.label === selectedDay && !day.muted" (click)="selectDay(day)">{{ day.label }}</button>
          }
        </div>
      } @else if (view === 'months') {
        <div class="ds-date-calendar__choices">
          @for (month of months; track month) { <button type="button" [class.ds-date-calendar__choice--selected]="month === months[selectedMonth]" (click)="chooseMonth($index)">{{ month }}</button> }
        </div>
      } @else {
        <div class="ds-date-calendar__choices">
          @for (year of years; track year) { <button type="button" [class.ds-date-calendar__choice--selected]="year === selectedYear" (click)="chooseYear(year)">{{ year }}</button> }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateCalendarComponent {
  private readonly changeDetector = inject(ChangeDetectorRef)
  reset(day: number, month: number, year: number): void { this.selectedDay = day; this.selectedMonth = month; this.selectedYear = year; this.view = 'calendar'; this.changeDetector.markForCheck() }
  navigateDays(event: KeyboardEvent): void {
    const button = event.target as HTMLButtonElement
    const parent = button.parentElement
    if (!parent || button.tagName !== 'BUTTON') return
    const buttons = Array.from(parent.querySelectorAll<HTMLButtonElement>('button'))
    const index = buttons.indexOf(button)
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault(); this.moveMonth(event.key === 'PageUp' ? -1 : 1); this.changeDetector.detectChanges()
      parent.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus(); return
    }
    let next = event.key === 'Home' ? index - index % 7 : event.key === 'End' ? index + 6 - index % 7 : index + (steps[event.key] ?? 0)
    if (!['Home', 'End', ...Object.keys(steps)].includes(event.key)) return
    event.preventDefault()
    next = Math.max(0, Math.min(buttons.length - 1, next))
    buttons[next]?.focus()
  }

  @Input() view: CalendarView = 'calendar'
  @Input() selectedDay = 24
  @Input() selectedYear = 2024
  @Input() selectedMonth = 2
  @Output() readonly selectedYearChange = new EventEmitter<number>()
  @Output() readonly selectedMonthChange = new EventEmitter<number>()
  @Output() readonly dateChange = new EventEmitter<Date>()
  @Output() readonly selectedDayChange = new EventEmitter<number>()
  readonly weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  get years(): number[] { return Array.from({ length: 12 }, (_, index) => this.selectedYear - 6 + index) }
  get selectedDateLabel(): string { return new Date(this.selectedYear, this.selectedMonth, this.selectedDay).toDateString() }
  get days(): readonly CalendarDay[] {
    const start = new Date(this.selectedYear, this.selectedMonth, 1).getDay()
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(this.selectedYear, this.selectedMonth, index - start + 1)
      return { label: date.getDate(), muted: date.getMonth() !== this.selectedMonth, date }
    })
  }
  moveMonth(delta: number): void {
    const date = new Date(this.selectedYear, this.selectedMonth + delta, 1)
    this.selectedYear = date.getFullYear(); this.selectedMonth = date.getMonth()
    this.selectedDay = Math.min(this.selectedDay, new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate())
    this.selectedMonthChange.emit(this.selectedMonth); this.selectedYearChange.emit(this.selectedYear)
  }
  chooseMonth(month: number): void { this.moveMonth(month - this.selectedMonth); this.view = 'calendar' }

  cycleView(): void {
    this.view = this.view === 'calendar' ? 'months' : this.view === 'months' ? 'years' : 'calendar'
  }

  selectDay(day: CalendarDay): void {
    this.selectedYear = day.date.getFullYear()
    this.selectedMonth = day.date.getMonth()
    this.selectedYearChange.emit(this.selectedYear)
    this.selectedMonthChange.emit(this.selectedMonth)
    this.dateChange.emit(new Date(day.date))
    this.selectedDay = day.label
    this.selectedDayChange.emit(day.label)
  }

  chooseYear(year: number): void {
    this.selectedYear = year
    this.selectedYearChange.emit(year)
    this.selectedDay = Math.min(this.selectedDay, new Date(year, this.selectedMonth + 1, 0).getDate())
    this.view = 'calendar'
  }
}

let nextDatePickerId = 0
@Component({
  selector: 'ds-date-picker', standalone: true, imports: [DateCalendarComponent],
  host: { class: 'ds-picker-field' },
  template: `
    <label class="ds-field__label" [class.ds-field__label--error]="error" [for]="inputId">{{ label }}</label>
    <span class="ds-picker-field__control">
      <input #trigger [id]="inputId" inputmode="numeric" [placeholder]="placeholder" [value]="value" [disabled]="disabled"
        role="combobox" aria-haspopup="dialog" aria-autocomplete="none" [attr.aria-expanded]="opened" [attr.aria-controls]="inputId + '-panel'"
        [attr.aria-invalid]="error ? 'true' : null" [attr.aria-describedby]="error ? inputId + '-error' : null"
        (input)="onInput($event)" (click)="openPicker()" (keydown)="onKey($event)" />
      <span class="ds-picker-field__calendar-icon" aria-hidden="true"><span></span></span>
    </span>
    @if (error) { <span class="ds-field__hint ds-field__hint--error" [id]="inputId + '-error'">{{ error }}</span> }
    <dialog #panel class="ds-picker-overlay" [id]="inputId + '-panel'" [attr.aria-label]="label + ': select date'"
      (cancel)="closePicker($event)" (click)="onBackdrop($event)" (close)="onClosed()">
      <ds-date-calendar [selectedDay]="day" [selectedMonth]="month" [selectedYear]="year" (dateChange)="choose($event)" />
      <div class="ds-picker-overlay__actions"><button type="button" class="ds-button ds-button--ghost" (click)="closePicker()">Cancel</button></div>
    </dialog>
  `, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent {
  @Input() label = 'Date'
  @Input() placeholder = 'MM / DD / YYYY'
  @Input() value = ''
  @Input() error = ''
  @Input() disabled = false
  @Output() readonly valueChange = new EventEmitter<string>()
  @ViewChild(DateCalendarComponent) calendar!: DateCalendarComponent
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLDialogElement>
  @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLInputElement>
  private readonly changeDetector = inject(ChangeDetectorRef)
  readonly inputId = `ds-date-picker-${++nextDatePickerId}`
  opened = false
  day = new Date().getDate()
  month = new Date().getMonth()
  year = new Date().getFullYear()
  openPicker(): void {
    if (this.disabled || this.opened) return
    const parts = this.value.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/)
    const parsed = parts ? new Date(+parts[3], +parts[1] - 1, +parts[2]) : new Date()
    const date = parts && (parsed.getMonth() !== +parts[1] - 1 || parsed.getDate() !== +parts[2]) ? new Date() : parsed
    this.day = date.getDate(); this.month = date.getMonth(); this.year = date.getFullYear()
    this.calendar.reset(this.day, this.month, this.year); this.opened = true; this.changeDetector.detectChanges()
    this.panel.nativeElement.showModal(); this.reposition()
    this.panel.nativeElement.querySelector<HTMLButtonElement>('.ds-date-calendar__days [aria-pressed="true"]')?.focus()
  }
  onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter') { event.preventDefault(); this.openPicker() }
  }
  onInput(event: Event): void { this.value = (event.target as HTMLInputElement).value; this.valueChange.emit(this.value) }
  choose(date: Date): void {
    this.value = `${String(date.getMonth() + 1).padStart(2, '0')} / ${String(date.getDate()).padStart(2, '0')} / ${date.getFullYear()}`
    this.valueChange.emit(this.value); this.closePicker()
  }
  closePicker(event?: Event): void { event?.preventDefault(); this.opened = false; this.panel.nativeElement.close(); this.trigger.nativeElement.focus() }
  onClosed(): void { this.opened = false }
  onBackdrop(event: MouseEvent): void { if (isBackdropClick(event, this.panel.nativeElement)) this.closePicker() }
  @HostListener('window:resize') reposition(): void { if (this.opened) positionOverlay(this.panel.nativeElement, this.trigger.nativeElement, true) }
}
