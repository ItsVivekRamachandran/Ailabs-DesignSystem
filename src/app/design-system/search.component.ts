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
            <img src="assets/search/x-circle.svg" alt="" />
          </button>
        }
        <button dsButton class="ds-search__mini" variant="primary" size="sm" [iconOnly]="true" type="submit" aria-label="Search">
          <img src="assets/search/search.svg" alt="" />
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
        <img src="assets/search/arrow-left.svg" alt="" />
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
            <img src="assets/search/x-circle.svg" alt="" />
          </button>
          <button class="ds-search__action" type="button" aria-label="Start voice search" (click)="voice.emit()">
            <img src="assets/search/mic.svg" alt="" />
          </button>
        } @else {
          <button dsButton class="ds-search__mini" variant="primary" size="sm" [iconOnly]="true" type="submit" aria-label="Search">
            <img src="assets/search/search.svg" alt="" />
          </button>
        }
      </span>
    </form>
    <img class="ds-search-panel__divider" src="assets/search/divider-docked.svg" alt="" />
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
