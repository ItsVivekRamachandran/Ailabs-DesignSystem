import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

let nextDatePickerId = 0

@Component({
  selector: 'ds-date-picker',
  standalone: true,
  host: { class: 'ds-picker-field' },
  template: `
    <label class="ds-field__label" [class.ds-field__label--error]="error" [for]="inputId">{{ label }}</label>
    <span class="ds-picker-field__control">
      <input [id]="inputId" inputmode="numeric" [placeholder]="placeholder" [value]="value" [disabled]="disabled" [attr.aria-invalid]="error ? 'true' : null" [attr.aria-describedby]="error ? inputId + '-error' : null" (input)="onInput($event)" />
      <span class="ds-picker-field__calendar-icon" aria-hidden="true"><span></span></span>
    </span>
    @if (error) { <span class="ds-field__hint ds-field__hint--error" [id]="inputId + '-error'">{{ error }}</span> }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent {
  @Input() label = 'Label'
  @Input() placeholder = 'MM / DD / YYYY'
  @Input() value = ''
  @Input() error = ''
  @Input() disabled = false
  @Output() readonly valueChange = new EventEmitter<string>()
  readonly inputId = `ds-date-picker-${++nextDatePickerId}`

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value
    this.valueChange.emit(this.value)
  }
}

export type CalendarView = 'calendar' | 'months' | 'years'

interface CalendarDay {
  readonly label: number
  readonly muted?: boolean
}

@Component({
  selector: 'ds-date-calendar',
  standalone: true,
  host: { class: 'ds-date-calendar' },
  template: `
    <header class="ds-picker-panel__header"><span>Select date</span><strong>Fri, Mar {{ selectedDay }}</strong></header>
    <div class="ds-date-calendar__body">
      <div class="ds-date-calendar__toolbar">
        <button type="button" (click)="cycleView()">{{ view === 'years' ? selectedYear : 'March ' + selectedYear }} <span aria-hidden="true">↓</span></button>
        @if (view === 'calendar') {
          <span><button type="button" aria-label="Previous month">‹</button><button type="button" aria-label="Next month">›</button></span>
        }
      </div>
      @if (view === 'calendar') {
        <div class="ds-date-calendar__weekdays">@for (day of weekdays; track day) { <span>{{ day }}</span> }</div>
        <div class="ds-date-calendar__days">
          @for (day of days; track $index) {
            <button type="button" [class.ds-date-calendar__day--muted]="day.muted" [class.ds-date-calendar__day--selected]="day.label === selectedDay && !day.muted" (click)="selectDay(day)">{{ day.label }}</button>
          }
        </div>
      } @else if (view === 'months') {
        <div class="ds-date-calendar__choices">
          @for (month of months; track month) { <button type="button" [class.ds-date-calendar__choice--selected]="month === 'Mar'" (click)="view = 'calendar'">{{ month }}</button> }
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
  @Input() view: CalendarView = 'calendar'
  @Input() selectedDay = 24
  @Input() selectedYear = 2024
  @Output() readonly selectedDayChange = new EventEmitter<number>()
  readonly weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  readonly years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031]
  readonly days: readonly CalendarDay[] = [
    { label: 25, muted: true }, { label: 26, muted: true }, { label: 27, muted: true }, { label: 28, muted: true }, { label: 29, muted: true },
    { label: 1 }, { label: 2 }, { label: 3 }, { label: 4 }, { label: 5 }, { label: 6 }, { label: 7 }, { label: 8 }, { label: 9 },
    { label: 10 }, { label: 11 }, { label: 12 }, { label: 13 }, { label: 14 }, { label: 15 }, { label: 16 }, { label: 17 }, { label: 18 },
    { label: 19 }, { label: 20 }, { label: 21 }, { label: 22 }, { label: 23 }, { label: 24 }, { label: 25 }, { label: 26 }, { label: 27 },
    { label: 28 }, { label: 29 }, { label: 30 }, { label: 31 }, { label: 1, muted: true }, { label: 2, muted: true }, { label: 3, muted: true },
    { label: 4, muted: true }, { label: 5, muted: true }, { label: 6, muted: true },
  ]

  cycleView(): void {
    this.view = this.view === 'calendar' ? 'months' : this.view === 'months' ? 'years' : 'calendar'
  }

  selectDay(day: CalendarDay): void {
    if (day.muted) return
    this.selectedDay = day.label
    this.selectedDayChange.emit(day.label)
  }

  chooseYear(year: number): void {
    this.selectedYear = year
    this.view = 'calendar'
  }
}
