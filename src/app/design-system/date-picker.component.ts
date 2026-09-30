import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core'
import { IconComponent } from './icon.component'
import { isBackdropClick, positionOverlay } from './overlay'
import { centerDialog, containDialogFocus, formatDate, parseDate, sameDate } from './picker-utils'
export type CalendarView = 'calendar' | 'months' | 'years'
export type DatePickerPresentation = 'auto' | 'docked' | 'modal'
interface CalendarDay { date: Date; outside: boolean }
@Component({
  selector: 'ds-date-calendar', standalone: true, imports: [IconComponent], host: { class: 'ds-date-calendar' },
  template: `
    <div class="ds-calendar__navigation">
      <div class="ds-calendar__nav-group">
        <button type="button" class="ds-picker-icon" aria-label="Previous month" title="Previous month (Page Up)" (click)="moveMonth(-1)"><ds-icon name="chevron_left" /></button>
        <button type="button" class="ds-picker-text ds-calendar__menu" aria-label="Choose month" [attr.aria-expanded]="view === 'months'" (click)="showView('months')">{{ months[displayMonth] }}<ds-icon name="arrow_drop_down" /></button>
        <button type="button" class="ds-picker-icon" aria-label="Next month" title="Next month (Page Down)" (click)="moveMonth(1)"><ds-icon name="chevron_right" /></button>
      </div>
      <div class="ds-calendar__nav-group">
        <button type="button" class="ds-picker-icon" aria-label="Previous year" title="Previous year (Shift + Page Up)" (click)="moveMonth(-12)"><ds-icon name="chevron_left" /></button>
        <button type="button" class="ds-picker-text ds-calendar__menu" aria-label="Choose year" [attr.aria-expanded]="view === 'years'" (click)="showView('years')">{{ displayYear }}<ds-icon name="arrow_drop_down" /></button>
        <button type="button" class="ds-picker-icon" aria-label="Next year" title="Next year (Shift + Page Down)" (click)="moveMonth(12)"><ds-icon name="chevron_right" /></button>
      </div>
    </div>
    <span class="ds-visually-hidden" aria-live="polite">{{ monthLabel }}</span>
    @if (view === 'calendar') {
      <div class="ds-calendar__grid" role="grid" [attr.aria-label]="monthLabel" (keydown)="navigate($event)" (touchstart)="touchStart($event)" (touchend)="touchEnd($event)">
        <div class="ds-calendar__week" role="row">@for (day of weekdays; track $index) { <span role="columnheader" [attr.aria-label]="day" [title]="day">{{ day[0] }}</span> }</div>
        @for (week of weeks; track $index) {
          <div class="ds-calendar__week" role="row">
            @for (day of week; track day.date.getTime()) {
              <div role="gridcell" [attr.aria-selected]="isSelected(day.date)">
                <button type="button" class="ds-calendar__day" [class.is-outside]="day.outside" [class.is-selected]="isSelected(day.date)" [class.is-today]="isToday(day.date)"
                  [disabled]="isDisabled(day.date)" [attr.tabindex]="isFocused(day.date) ? 0 : -1" [attr.aria-label]="dateLabel(day.date)" [attr.aria-current]="isToday(day.date) ? 'date' : null"
                  [attr.data-date]="day.date.getTime()" (focus)="focused = day.date" (click)="select(day.date)"><span>{{ day.date.getDate() }}</span></button>
              </div>
            }
          </div>
        }
      </div>
    } @else {
      <div class="ds-calendar__choices" [attr.aria-label]="view === 'months' ? 'Choose month' : 'Choose year'" (keydown)="navigateChoices($event)">
        @if (view === 'months') {
          @for (month of months; track month; let i = $index) { <button type="button" class="ds-picker-text" [attr.aria-pressed]="i === displayMonth" (click)="chooseMonth(i)">{{ month }}</button> }
        } @else {
          @for (year of years; track year) { <button type="button" class="ds-picker-text" [attr.aria-pressed]="year === displayYear" (click)="chooseYear(year)">{{ year }}</button> }
        }
      </div>
    }
  `, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateCalendarComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef)
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef)
  @Input() view: CalendarView = 'calendar'
  @Input() selectedDay = new Date().getDate()
  @Input() selectedMonth = new Date().getMonth()
  @Input() selectedYear = new Date().getFullYear()
  @Input() min = ''
  @Input() max = ''
  @Output() readonly dateChange = new EventEmitter<Date>()
  @Output() readonly selectedDayChange = new EventEmitter<number>()
  @Output() readonly selectedMonthChange = new EventEmitter<number>()
  @Output() readonly selectedYearChange = new EventEmitter<number>()
  @Output() readonly confirm = new EventEmitter<Date>()
  @Output() readonly viewChange = new EventEmitter<void>()
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  readonly weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  displayMonth = this.selectedMonth
  displayYear = this.selectedYear
  focused = new Date()
  private touchX = 0
  get selected(): Date { const date = new Date(0); date.setHours(0, 0, 0, 0); date.setFullYear(this.selectedYear, this.selectedMonth, this.selectedDay); return date }
  get monthLabel(): string { return new Date(this.displayYear, this.displayMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
  get years(): number[] { const start = Math.max(1, this.displayYear - 100); return Array.from({ length: Math.min(201, 10000 - start) }, (_, i) => start + i) }
  get weeks(): CalendarDay[][] {
    const start = new Date(this.displayYear, this.displayMonth, 1).getDay()
    const count = new Date(this.displayYear, this.displayMonth + 1, 0).getDate()
    return Array.from({ length: Math.ceil((start + count) / 7) }, (_, week) => Array.from({ length: 7 }, (_, day) => {
      const date = new Date(this.displayYear, this.displayMonth, week * 7 + day - start + 1)
      return { date, outside: date.getMonth() !== this.displayMonth }
    }))
  }
  reset(day: number, month: number, year: number): void { this.selectedDay = day; this.selectedMonth = month; this.selectedYear = year; this.displayMonth = month; this.displayYear = year; this.focused = this.selected; this.view = 'calendar'; this.cdr.markForCheck() }
  ngOnChanges(changes: SimpleChanges): void { if (changes['selectedDay'] || changes['selectedMonth'] || changes['selectedYear']) this.reset(this.selectedDay, this.selectedMonth, this.selectedYear) }
  dateLabel(date: Date): string { return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }
  isSelected(date: Date): boolean { return sameDate(this.selected, date) }
  isFocused(date: Date): boolean { return sameDate(this.focused, date) }
  isToday(date: Date): boolean { return sameDate(new Date(), date) }
  isDisabled(date: Date): boolean { const min = parseDate(this.min), max = parseDate(this.max); return !!(min && date < min || max && date > max) }
  select(date: Date): void {
    if (this.isDisabled(date)) return
    this.selectedDay = date.getDate(); this.selectedMonth = date.getMonth(); this.selectedYear = date.getFullYear(); this.focused = date
    this.displayMonth = this.selectedMonth; this.displayYear = this.selectedYear
    this.selectedDayChange.emit(this.selectedDay); this.selectedMonthChange.emit(this.selectedMonth); this.selectedYearChange.emit(this.selectedYear); this.dateChange.emit(date)
  }
  moveMonth(delta: number): void {
    const first = new Date(this.displayYear, this.displayMonth + delta, 1)
    if (first.getFullYear() < 1 || first.getFullYear() > 9999) return
    this.displayMonth = first.getMonth(); this.displayYear = first.getFullYear()
    this.focused = new Date(this.displayYear, this.displayMonth, Math.min(this.focused.getDate(), new Date(this.displayYear, this.displayMonth + 1, 0).getDate()))
    this.cdr.detectChanges(); this.viewChange.emit()
  }
  showView(view: CalendarView): void { this.view = this.view === view ? 'calendar' : view; this.cdr.detectChanges(); const current = this.element.nativeElement.querySelector<HTMLElement>('.ds-calendar__choices [aria-pressed="true"]'); current?.scrollIntoView({ block: 'center' }); current?.focus(); this.viewChange.emit() }
  chooseMonth(month: number): void { this.moveMonth(month - this.displayMonth); this.view = 'calendar'; this.focusDate() }
  chooseYear(year: number): void { this.moveMonth((year - this.displayYear) * 12); this.view = 'calendar'; this.focusDate() }
  focusDate(): void { this.cdr.detectChanges(); this.element.nativeElement.querySelector<HTMLButtonElement>(`[data-date="${this.focused.getTime()}"]`)?.focus(); this.viewChange.emit() }
  navigate(event: KeyboardEvent): void {
    if (!(event.target as HTMLElement).matches('button[data-date]')) return
    if (event.shiftKey && ['M', 'm', 'Y', 'y'].includes(event.key)) { event.preventDefault(); this.showView(event.key.toLowerCase() === 'm' ? 'months' : 'years'); return }
    if (event.key === 'Enter') { event.preventDefault(); if (!this.isDisabled(this.focused)) { this.select(this.focused); this.confirm.emit(this.focused) } return }
    if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); this.moveMonth((event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1)); this.focusDate(); return }
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (!(event.key in offsets) && !['Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = new Date(this.focused)
    next.setDate(event.key === 'Home' ? 1 : event.key === 'End' ? new Date(this.displayYear, this.displayMonth + 1, 0).getDate() : next.getDate() + offsets[event.key])
    if (this.isDisabled(next)) return
    this.focused = next; this.displayMonth = next.getMonth(); this.displayYear = next.getFullYear(); this.focusDate()
  }
  navigateChoices(event: KeyboardEvent): void {
    const buttons = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button')), index = buttons.indexOf(event.target as HTMLButtonElement)
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }
    if (!(event.key in offsets)) return
    event.preventDefault(); buttons[Math.max(0, Math.min(buttons.length - 1, index + offsets[event.key]))]?.focus()
  }
  touchStart(event: TouchEvent): void { this.touchX = event.changedTouches[0].clientX }
  touchEnd(event: TouchEvent): void { const delta = event.changedTouches[0].clientX - this.touchX; if (Math.abs(delta) > 60) this.moveMonth(delta > 0 ? -1 : 1) }
}

let nextDatePickerId = 0
@Component({
  selector: 'ds-date-picker', standalone: true, imports: [DateCalendarComponent, IconComponent], host: { class: 'ds-picker-field ds-material-field' },
  template: `
    <label class="ds-field__label" [for]="inputId">{{ label }}</label>
    <span class="ds-picker-field__control">
      <input #trigger [id]="inputId" [placeholder]="placeholder" [value]="value" [disabled]="disabled" [attr.aria-invalid]="message ? 'true' : null" [attr.aria-describedby]="inputId + '-hint'"
        (input)="onInput($event)" (blur)="finishTyping()" (click)="openPicker(false)" (keydown)="onKey($event)" />
      <button #opener type="button" class="ds-picker-field__toggle ds-picker-icon" [disabled]="disabled" [attr.aria-label]="'Choose ' + label.toLowerCase()" aria-haspopup="dialog" [attr.aria-expanded]="opened" [attr.aria-controls]="inputId + '-panel'" (click)="opened ? closePicker() : openPicker(true)"><ds-icon name="calendar_month" /></button>
    </span>
    <span class="ds-field__hint" [class.ds-field__hint--error]="message" [id]="inputId + '-hint'">{{ message || 'MM/DD/YYYY · Alt + ↓ opens calendar' }}</span>
    <dialog #panel popover="manual" class="ds-picker-overlay ds-date-overlay" [class.is-modal]="modal" [class.is-input]="inputMode" [id]="inputId + '-panel'" [attr.aria-label]="label + ': select date'" [attr.aria-modal]="modal" (cancel)="closePicker($event)" (click)="onBackdrop($event)" (keydown)="panelKey($event)">
      @if (modal || inputMode) {
        <header class="ds-date-header"><span>Select date</span><div><strong>{{ inputMode ? 'Enter date' : headline }}</strong>
          @if (canShowCalendar) { <button type="button" class="ds-picker-icon" [attr.aria-label]="inputMode ? 'Switch to calendar' : 'Switch to date input'" (click)="toggleMode()"><ds-icon [name]="inputMode ? 'calendar_month' : 'edit'" /></button> }
        </div></header>
      }
      <div [hidden]="inputMode"><ds-date-calendar [min]="min" [max]="max" (dateChange)="choose($event)" (confirm)="choose($event); apply()" (viewChange)="reposition()" /></div>
      @if (inputMode) {
        <div class="ds-date-entry"><label [for]="inputId + '-entry'">Date</label><input #entry [id]="inputId + '-entry'" [value]="draftText" placeholder="MM/DD/YYYY" inputmode="numeric" [attr.aria-invalid]="draftError ? 'true' : null" [attr.aria-describedby]="inputId + '-entry-hint'" (input)="editDraft($event)" (keydown.enter)="apply()" /><span [id]="inputId + '-entry-hint'" [class.ds-field__hint--error]="draftError">{{ draftError || 'MM/DD/YYYY' }}</span></div>
      }
      <div class="ds-picker-overlay__actions">
        @if (!modal && !inputMode) { <button type="button" class="ds-picker-icon" aria-label="Switch to date input" (click)="toggleMode()"><ds-icon name="edit" /></button> }
        <span class="ds-picker-action-spacer"></span><button type="button" class="ds-picker-text" (click)="closePicker()">Cancel</button><button type="button" class="ds-picker-text" (click)="apply()">OK</button>
      </div>
    </dialog>
  `, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent {
  @Input() label = 'Date'
  @Input() placeholder = 'MM / DD / YYYY'
  @Input() value = ''
  @Input() error = ''
  @Input() disabled = false
  @Input() min = ''
  @Input() max = ''
  @Input() presentation: DatePickerPresentation = 'auto'
  @Output() readonly valueChange = new EventEmitter<string>()
  @ViewChild(DateCalendarComponent) calendar!: DateCalendarComponent
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLDialogElement>
  @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLInputElement>
  @ViewChild('opener', { static: true }) opener!: ElementRef<HTMLButtonElement>
  private readonly cdr = inject(ChangeDetectorRef)
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef)
  private returnFocus?: HTMLElement
  readonly inputId = `ds-date-picker-${++nextDatePickerId}`
  opened = false
  modal = false
  inputMode = false
  canShowCalendar = true
  draft = new Date()
  draftText = ''
  draftError = ''
  inputError = ''
  get message(): string { return this.error || this.inputError }
  get headline(): string { return this.draft.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }
  openPicker(moveFocus = true): void {
    if (this.disabled || this.opened) return
    this.returnFocus = document.activeElement as HTMLElement
    this.modal = this.presentation === 'modal' || this.presentation === 'auto' && window.innerWidth < 600
    this.canShowCalendar = window.innerWidth >= 360
    this.inputMode = !this.canShowCalendar; this.draftError = ''
    this.draft = parseDate(this.value) || new Date(); this.draft.setHours(0, 0, 0, 0)
    const min = parseDate(this.min), max = parseDate(this.max)
    if (min && this.draft < min) this.draft = min
    if (max && this.draft > max) this.draft = max
    this.draftText = this.value || formatDate(this.draft)
    this.calendar.reset(this.draft.getDate(), this.draft.getMonth(), this.draft.getFullYear())
    this.opened = true; this.cdr.detectChanges()
    if (this.modal) this.panel.nativeElement.showModal(); else this.panel.nativeElement.showPopover()
    this.reposition()
    if (this.inputMode) this.panel.nativeElement.querySelector<HTMLInputElement>('.ds-date-entry input')?.focus()
    else if (moveFocus || this.modal) this.calendar.focusDate()
  }
  onInput(event: Event): void { this.value = (event.target as HTMLInputElement).value; this.inputError = '' }
  finishTyping(): void {
    if (!this.value.trim()) { this.inputError = ''; this.valueChange.emit(''); return }
    const date = parseDate(this.value)
    if (!date || this.calendar?.isDisabled(date)) { this.inputError = 'Enter a valid date within the allowed range'; return }
    this.value = formatDate(date); this.valueChange.emit(this.value)
    if (this.opened) { this.draft = date; this.draftText = this.value; this.calendar.reset(date.getDate(), date.getMonth(), date.getFullYear()) }
  }
  onKey(event: KeyboardEvent): void { if (event.altKey && event.key === 'ArrowDown') { event.preventDefault(); this.openPicker(true) } else if (event.key === 'Enter') { event.preventDefault(); this.finishTyping(); if (this.opened && !this.inputError) this.closePicker() } else if (event.key === 'Escape' && this.opened) this.closePicker(event) }
  choose(date: Date): void { this.draft = date; this.draftText = formatDate(date) }
  editDraft(event: Event): void { this.draftText = (event.target as HTMLInputElement).value; this.draftError = '' }
  toggleMode(): void { this.inputMode = !this.inputMode; this.cdr.detectChanges(); this.reposition(); if (this.inputMode) this.panel.nativeElement.querySelector<HTMLInputElement>('.ds-date-entry input')?.focus(); else this.calendar.focusDate() }
  apply(): void {
    const date = this.inputMode ? parseDate(this.draftText) : this.draft
    if (!date || this.calendar.isDisabled(date)) { this.draftError = 'Enter a valid date within the allowed range'; this.cdr.detectChanges(); this.panel.nativeElement.querySelector<HTMLInputElement>('.ds-date-entry input')?.focus(); return }
    this.value = formatDate(date); this.inputError = ''; this.valueChange.emit(this.value); this.closePicker()
  }
  closePicker(event?: Event, restore = true): void { event?.preventDefault(); if (!this.opened) return; this.opened = false; if (this.modal) this.panel.nativeElement.close(); else this.panel.nativeElement.hidePopover(); if (restore) (this.returnFocus?.isConnected ? this.returnFocus : this.trigger.nativeElement).focus(); this.cdr.markForCheck() }
  panelKey(event: KeyboardEvent): void { if (event.key === 'Escape') this.closePicker(event); else if (this.modal) containDialogFocus(this.panel.nativeElement, event) }
  onBackdrop(event: MouseEvent): void { if (this.modal && isBackdropClick(event, this.panel.nativeElement)) this.closePicker() }
  @HostListener('document:pointerdown', ['$event']) outside(event: PointerEvent): void { if (this.opened && !this.modal && !this.element.nativeElement.contains(event.target as Node)) this.closePicker(undefined, false) }
  @HostListener('window:resize') reposition(): void { if (!this.opened) return; if (this.modal) centerDialog(this.panel.nativeElement); else positionOverlay(this.panel.nativeElement, this.trigger.nativeElement) }
  @HostListener('document:scroll', ['$event']) onScroll(event: Event): void { if (this.opened && !this.modal && !this.panel.nativeElement.contains(event.target as Node)) this.reposition() }
}
