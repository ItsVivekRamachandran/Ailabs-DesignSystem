import { IconComponent } from './icon.component'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core'
import { positionOverlay } from './overlay'
export interface DropdownOption { value: string; label: string; disabled?: boolean }
let nextId = 0
@Component({
  selector: 'ds-dropdown', standalone: true, imports: [IconComponent], host: { class: 'ds-dropdown' },
  template: `
    <label class="ds-field__label" [for]="id">{{ label }}</label>
    <button #trigger type="button" class="ds-dropdown__trigger" [id]="id" role="combobox" aria-haspopup="listbox"
      [disabled]="disabled" [attr.aria-expanded]="opened" [attr.aria-controls]="id + '-list'"
      [attr.aria-activedescendant]="opened && active >= 0 ? id + '-option-' + active : null"
      [attr.aria-invalid]="error ? 'true' : null" [attr.aria-describedby]="error || hint ? id + '-hint' : null"
      (click)="opened ? close() : open()" (keydown)="onKey($event)">
      <span [class.ds-dropdown__placeholder]="!selectedLabel">{{ selectedLabel || placeholder }}</span><ds-icon name="arrow_drop_down" />
    </button>
    @if (error || hint) { <span [id]="id + '-hint'" class="ds-field__hint" [class.ds-field__hint--error]="error">{{ error || hint }}</span> }
    <div #panel popover="auto" class="ds-dropdown__list" role="listbox" [id]="id + '-list'" [attr.aria-label]="label" (toggle)="onToggle($event)">
      @for (option of options; track option.value; let i = $index) {
        <div role="option" class="ds-dropdown__option" [id]="id + '-option-' + i" [attr.aria-selected]="option.value === value"
          [attr.aria-disabled]="!!option.disabled" [class.is-active]="active === i" (mousedown)="$event.preventDefault()" (click)="choose(i)">
          <span>{{ option.label }}</span>@if (option.value === value) { <ds-icon name="check" /> }
        </div>
      } @empty { <div class="ds-dropdown__empty">No options available</div> }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  @Input() label = 'Select option'
  @Input() placeholder = 'Choose an option'
  @Input() options: readonly DropdownOption[] = []
  @Input() value = ''
  @Input() disabled = false
  @Input() error = ''
  @Input() hint = ''
  @Output() readonly valueChange = new EventEmitter<string>()
  @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLButtonElement>
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLElement>
  private readonly cdr = inject(ChangeDetectorRef)
  readonly id = `ds-dropdown-${++nextId}`
  opened = false
  active = -1
  private typed = ''
  private typedAt = 0
  get selectedLabel(): string { return this.options.find(o => o.value === this.value)?.label || '' }
  open(): void {
    if (this.disabled || this.opened) return
    this.active = this.options.findIndex(o => o.value === this.value && !o.disabled)
    if (this.active < 0) this.active = this.options.findIndex(o => !o.disabled)
    this.opened = true; this.cdr.detectChanges(); this.panel.nativeElement.showPopover(); this.reposition(); this.reveal()
  }
  close(): void { this.opened = false; this.panel.nativeElement.hidePopover() }
  onToggle(event: Event): void { this.opened = (event as ToggleEvent).newState === 'open'; this.cdr.markForCheck() }
  choose(index: number): void {
    const option = this.options[index]
    if (!option || option.disabled) return
    this.value = option.value; this.valueChange.emit(this.value); this.close(); this.trigger.nativeElement.focus()
  }
  private reveal(): void { this.cdr.detectChanges(); this.panel.nativeElement.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' }) }
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Tab') { if (this.opened) this.close(); return }
    if (event.key === 'Escape') { if (this.opened) { event.preventDefault(); this.close() } return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.opened ? this.choose(this.active) : this.open(); return }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      if (!this.opened) { this.open(); if (event.key !== 'End') return }
      const enabled = this.options.map((o, i) => o.disabled ? -1 : i).filter(i => i >= 0)
      if (!enabled.length) { this.active = -1; return }
      const index = enabled.indexOf(this.active)
      this.active = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1)! : enabled[Math.max(0, Math.min(enabled.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]
      this.reveal(); return
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); if (!this.opened) this.open()
      this.typed = Date.now() - this.typedAt > 700 ? event.key : this.typed + event.key; this.typedAt = Date.now()
      const index = this.options.findIndex(o => !o.disabled && o.label.toLowerCase().startsWith(this.typed.toLowerCase()))
      if (index >= 0) { this.active = index; this.reveal() }
    }
  }
  @HostListener('window:resize') reposition(): void {
    if (!this.opened) return
    this.panel.nativeElement.style.width = `${this.trigger.nativeElement.getBoundingClientRect().width}px`
    positionOverlay(this.panel.nativeElement, this.trigger.nativeElement)
  }
  @HostListener('document:scroll', ['$event']) onScroll(event: Event): void { if (this.opened && !this.panel.nativeElement.contains(event.target as Node)) this.reposition() }
}
