import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core'
import { ButtonComponent } from './button.component'

export type SearchState = 'default' | 'hovered' | 'focused'
export type SearchConfiguration = 'input' | 'supporting'

export interface SearchResult {
  readonly id: string
  readonly label: string
  readonly supportingText: string
}

const inputResults: readonly SearchResult[] = [
  { id: 'a', label: 'Label text', supportingText: 'Supporting line text, lorem ipsum dolor' },
  { id: 'b', label: 'Label text', supportingText: 'Supporting line text, lorem ipsum dolor' },
  { id: 'c', label: 'Label text', supportingText: 'Supporting line text, lorem ipsum dolor' },
]

const supportingResults: readonly SearchResult[] = [
  { id: 'd', label: 'Label text', supportingText: 'Supporting line text, lorem ipsum dolor' },
  { id: 'e', label: 'Label text', supportingText: 'Supporting line text, lorem ipsum dolor' },
  { id: 'f', label: 'Label text', supportingText: 'Supporting line text, lorem ipsum dolor' },
]

let nextSearchId = 0

@Component({
  selector: 'ds-search-bar',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <form class="ds-search-bar__surface" role="search" (submit)="submit($event)">
      <input
        class="ds-search-bar__input"
        type="search"
        [id]="inputId"
        [placeholder]="placeholder"
        [value]="value"
        [attr.aria-label]="ariaLabel"
        (input)="onInput($event)"
      />
      <span class="ds-search-bar__trailing">
        @if (value) {
          <button class="ds-search__action" type="button" aria-label="Clear search" (click)="clearSearch()">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M15 9 9 15M9 9l6 6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" /></svg>
          </button>
        }
        <button dsButton class="ds-search__mini" variant="primary" size="sm" [iconOnly]="true" type="submit" aria-label="Search">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m21 21-4.34-4.34M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg>
        </button>
      </span>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  @Input() placeholder = 'Hinted search text'
  @Input() ariaLabel = 'Search'
  @Input() value = ''
  @Input() state: SearchState = 'default'
  @Output() readonly valueChange = new EventEmitter<string>()
  @Output() readonly search = new EventEmitter<string>()
  @Output() readonly clear = new EventEmitter<void>()
  readonly inputId = `ds-search-bar-${++nextSearchId}`

  @HostBinding('class')
  get classes(): string {
    return `ds-search-bar ds-search-bar--${this.state}`
  }

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value
    this.valueChange.emit(this.value)
  }

  clearSearch(): void {
    this.value = ''
    this.valueChange.emit('')
    this.clear.emit()
  }

  submit(event: Event): void {
    event.preventDefault()
    this.search.emit(this.value)
  }
}

@Component({
  selector: 'ds-search-panel',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <form class="ds-search-panel__header" role="search" (submit)="submit($event)">
      <button class="ds-search__action ds-search-panel__leading" type="button" aria-label="Go back" (click)="back.emit()">
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m12 5-7 7 7 7M5 12h14" /></svg>
      </button>
      <input
        class="ds-search-panel__input"
        type="search"
        [id]="inputId"
        [placeholder]="placeholder"
        [value]="value"
        [attr.aria-label]="ariaLabel"
        (input)="onInput($event)"
      />
      <span class="ds-search-panel__trailing">
        @if (configuration === 'input') {
          <button class="ds-search__action" type="button" aria-label="Clear search" (click)="clearSearch()">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M15 9 9 15M9 9l6 6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" /></svg>
          </button>
          <button class="ds-search__action" type="button" aria-label="Start voice search" (click)="voice.emit()">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 19v3M5 10v2a7 7 0 0 0 14 0v-2M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" /></svg>
          </button>
        } @else {
          <button dsButton class="ds-search__mini" variant="primary" size="sm" [iconOnly]="true" type="submit" aria-label="Search">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m21 21-4.34-4.34M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg>
          </button>
        }
      </span>
    </form>
    <span class="ds-search-panel__divider" aria-hidden="true"></span>
    <div class="ds-search-panel__results" role="listbox" [attr.aria-label]="resultsLabel">
      @for (result of displayResults; track result.id) {
        <button class="ds-search-result" type="button" role="option" (click)="resultSelect.emit(result)">
          <span class="ds-search-result__text">
            <span class="ds-search-result__label">{{ result.label }}</span>
            <span class="ds-search-result__supporting">{{ result.supportingText }}</span>
          </span>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPanelComponent {
  @Input() configuration: SearchConfiguration = 'input'
  @Input() value = ''
  @Input() placeholder = 'Hinted search text'
  @Input() ariaLabel = 'Search'
  @Input() resultsLabel = 'Search results'
  @Input() results: readonly SearchResult[] = []
  @Output() readonly valueChange = new EventEmitter<string>()
  @Output() readonly search = new EventEmitter<string>()
  @Output() readonly clear = new EventEmitter<void>()
  @Output() readonly back = new EventEmitter<void>()
  @Output() readonly voice = new EventEmitter<void>()
  @Output() readonly resultSelect = new EventEmitter<SearchResult>()
  readonly inputId = `ds-search-panel-${++nextSearchId}`

  @HostBinding('class')
  get classes(): string {
    return `ds-search-panel ds-search-panel--${this.configuration}`
  }

  get displayResults(): readonly SearchResult[] {
    if (this.results.length) return this.results
    return this.configuration === 'input' ? inputResults : supportingResults
  }

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value
    this.valueChange.emit(this.value)
  }

  clearSearch(): void {
    this.value = ''
    this.valueChange.emit('')
    this.clear.emit()
  }

  submit(event: Event): void {
    event.preventDefault()
    this.search.emit(this.value)
  }
}
