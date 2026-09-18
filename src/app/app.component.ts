import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core'
import { colorRamps, radii, semanticColorGroups, spacing, strokes } from '../design-system/tokens'
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CheckboxComponent,
  ChipComponent,
  DateCalendarComponent,
  DatePickerComponent,
  InputComponent,
  ListItemComponent,
  MenuItemComponent,
  RadioComponent,
  SwitchComponent,
  TabComponent,
  TimeClockComponent,
  TimePickerComponent,
  TooltipComponent,
} from './design-system'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    ChipComponent,
    DateCalendarComponent,
    DatePickerComponent,
    InputComponent,
    ListItemComponent,
    MenuItemComponent,
    RadioComponent,
    SwitchComponent,
    TabComponent,
    TimeClockComponent,
    TimePickerComponent,
    TooltipComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  readonly theme = signal<'light' | 'dark'>('light')
  readonly themeLabel = computed(() => this.theme() === 'dark' ? 'Dark' : 'Light')
  readonly copied = signal(false)
  readonly copiedColorKey = signal('')
  readonly activeSection = signal('overview')
  readonly playgroundComponents = [
    { id: 'button', label: 'Button', description: 'Actions with hierarchy, size, icon, and disabled states.', importName: 'ButtonComponent' },
    { id: 'chip', label: 'Chip', description: 'Compact filters and selections in filled or outlined styles.', importName: 'ChipComponent' },
    { id: 'badge', label: 'Badge', description: 'Small status labels with semantic tones and optional dots.', importName: 'BadgeComponent' },
    { id: 'checkbox', label: 'Checkbox', description: 'Independent selection with checked and mixed states.', importName: 'CheckboxComponent' },
    { id: 'switch', label: 'Switch', description: 'Immediate on/off settings and preferences.', importName: 'SwitchComponent' },
    { id: 'radio', label: 'Radio', description: 'A single selection within a named option group.', importName: 'RadioComponent' },
    { id: 'input', label: 'Text field', description: 'Labeled input with hints, validation, and icon support.', importName: 'InputComponent' },
    { id: 'tabs', label: 'Tabs', description: 'Switch between related views at the same hierarchy.', importName: 'TabComponent' },
    { id: 'menu', label: 'Menu item', description: 'Command rows with active, shortcut, and disabled states.', importName: 'MenuItemComponent' },
    { id: 'list', label: 'List item', description: 'Single or two-line navigation and selection rows.', importName: 'ListItemComponent' },
  ] as const
  readonly playgroundComponent = signal('button')
  readonly playgroundVariant = signal('primary')
  readonly playgroundSize = signal('md')
  readonly playgroundState = signal('default')
  readonly playgroundDisabled = signal(false)
  readonly playgroundSelected = signal(false)
  readonly playgroundIcon = signal(false)
  readonly playgroundDot = signal(true)
  readonly playgroundSupporting = signal(true)
  readonly playgroundCopied = signal(false)
  readonly playgroundDefinition = computed(() => this.playgroundComponents.find((component) => component.id === this.playgroundComponent()) ?? this.playgroundComponents[0])
  readonly playgroundCode = computed(() => {
    const disabled = this.playgroundDisabled() ? ' disabled' : ''
    const icon = this.playgroundIcon() ? '<svg aria-hidden="true"><use href="#icon-sparkles"></use></svg>' : ''

    switch (this.playgroundComponent()) {
      case 'chip':
        return `<button dsChip variant="${this.playgroundVariant()}"${this.playgroundSelected() ? ' [selected]="true"' : ''}${disabled}>${icon}AI ready</button>`
      case 'badge':
        return `<ds-badge tone="${this.playgroundVariant()}"${this.playgroundDot() ? ' [dot]="true"' : ''}>Ready</ds-badge>`
      case 'checkbox':
        return `<ds-checkbox${this.playgroundState() === 'checked' ? ' [checked]="true"' : ''}${this.playgroundState() === 'indeterminate' ? ' [indeterminate]="true"' : ''}${this.playgroundDisabled() ? ' [disabled]="true"' : ''}>Include insights</ds-checkbox>`
      case 'switch':
        return `<ds-switch${this.playgroundSelected() ? ' [checked]="true"' : ''}${this.playgroundDisabled() ? ' [disabled]="true"' : ''}>Auto-save</ds-switch>`
      case 'radio':
        return `<ds-radio name="model" value="recommended"${this.playgroundSelected() ? ' [checked]="true"' : ''}${this.playgroundDisabled() ? ' [disabled]="true"' : ''}>Recommended</ds-radio>`
      case 'input': {
        const value = this.playgroundState() === 'filled' ? ' value="AI workspace"' : ''
        const error = this.playgroundState() === 'error' ? ' error="A project name is required"' : ''
        return `<ds-input label="Project name" placeholder="Enter project name"${value}${error}${this.playgroundIcon() ? ' icon="search"' : ''}${this.playgroundDisabled() ? ' [disabled]="true"' : ''} />`
      }
      case 'tabs':
        return `<div role="tablist">\n  <button dsTab${this.playgroundState() !== 'second' ? ' [active]="true"' : ''}>Overview</button>\n  <button dsTab${this.playgroundState() === 'second' ? ' [active]="true"' : ''}>Activity</button>\n  <button dsTab${disabled}>Settings</button>\n</div>`
      case 'menu':
        return `<button dsMenuItem${this.playgroundSupporting() ? ' shortcut="⌘K"' : ''}${this.playgroundSelected() ? ' [active]="true"' : ''}${disabled}>Open command</button>`
      case 'list':
        return `<button dsListItem title="AI workspace"${this.playgroundSupporting() ? ' supportingText="Updated moments ago"' : ''}${this.playgroundSelected() ? ' [selected]="true"' : ''}${disabled}>\n  <span avatar></span>\n  <span trailing>›</span>\n</button>`
      default:
        return `<button dsButton variant="${this.playgroundVariant()}" size="${this.playgroundSize()}"${disabled}>${icon}Run action</button>`
    }
  })
  readonly colorRamps = colorRamps
  readonly semanticColorGroups = semanticColorGroups
  readonly spacingGroups = [
    { name: 'Micro', range: '0–4px', description: 'Optical adjustments, icon gaps, and hairline offsets.', values: spacing.filter((value) => value <= 4) },
    { name: 'Compact', range: '6–16px', description: 'Dense controls, inline gaps, and internal padding.', values: spacing.filter((value) => value >= 6 && value <= 16) },
    { name: 'Component', range: '20–64px', description: 'Cards, sections, component groups, and page gutters.', values: spacing.filter((value) => value >= 20 && value <= 64) },
    { name: 'Layout', range: '80–160px', description: 'Large sections, hero spacing, and major page rhythm.', values: spacing.filter((value) => value >= 80) },
  ].map((group) => ({
    ...group,
    values: group.values.map((value) => ({ value, preview: value === 0 ? 0 : Math.min(100, Math.max(5, (value / 64) * 100)) })),
  }))
  readonly radiusTokens = Object.entries(radii).map(([name, value]) => ({
    name,
    value,
    usage: value <= 2 ? 'Fine detail' : value <= 6 ? 'Compact control' : value <= 12 ? 'Inputs & cards' : value <= 24 ? 'Large surface' : 'Pills & circles',
  }))
  readonly strokeTokens = Object.entries(strokes).map(([name, value]) => ({
    name,
    value,
    usage: {
      none: 'No visible border',
      hairline: 'High-density divider',
      'extra-thin': 'Subtle separator',
      thin: 'Standard surface border',
      default: 'Controls and inputs',
      medium: 'Selected or focused state',
      thick: 'Strong emphasis',
      heavy: 'Illustrative accent',
    }[name] ?? 'Interface stroke',
  }))
  private sectionObserver?: IntersectionObserver
  private copyResetTimer?: number
  private playgroundCopyResetTimer?: number

  constructor() {
    let savedTheme: string | null = null
    try { savedTheme = window.localStorage.getItem('ailabs-theme') } catch { /* Keep the default theme when storage is unavailable. */ }
    const initialTheme = savedTheme === 'dark' ? 'dark' : 'light'
    this.theme.set(initialTheme)
    this.applyTheme(initialTheme)
  }

  ngAfterViewInit(): void {
    const sectionIds = ['overview', 'foundations', 'colors', 'variables', 'components', 'playground']
    const hashSection = window.location.hash.slice(1)
    if (sectionIds.includes(hashSection)) this.activeSection.set(hashSection)

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top - 96) - Math.abs(b.boundingClientRect.top - 96))[0]

        if (visibleSection?.target.id) this.activeSection.set(visibleSection.target.id)
      },
      { rootMargin: '-88px 0px -62% 0px', threshold: [0, 0.05, 0.2] },
    )

    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (section) this.sectionObserver?.observe(section)
    })
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect()
    if (this.copyResetTimer) window.clearTimeout(this.copyResetTimer)
    if (this.playgroundCopyResetTimer) window.clearTimeout(this.playgroundCopyResetTimer)
  }

  selectSection(sectionId: string, event?: Event): void {
    event?.preventDefault()
    this.activeSection.set(sectionId)
    window.history.replaceState(null, '', `#${sectionId}`)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  toggleTheme(): void {
    const nextTheme = this.theme() === 'light' ? 'dark' : 'light'
    this.theme.set(nextTheme)
    this.applyTheme(nextTheme)
    try { window.localStorage.setItem('ailabs-theme', nextTheme) } catch { /* Theme still works for this session. */ }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.dataset['theme'] = theme
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0d120f' : '#fefdfc')
  }

  selectPlaygroundComponent(component: string): void {
    this.playgroundComponent.set(component)
    this.playgroundVariant.set(component === 'chip' ? 'filled' : component === 'badge' ? 'neutral' : 'primary')
    this.playgroundSize.set('md')
    this.playgroundState.set('default')
    this.playgroundDisabled.set(false)
    this.playgroundSelected.set(false)
    this.playgroundIcon.set(false)
    this.playgroundDot.set(true)
    this.playgroundSupporting.set(true)
    this.playgroundCopied.set(false)
  }

  async copyPlaygroundCode(): Promise<void> {
    await navigator.clipboard.writeText(this.playgroundCode())
    this.playgroundCopied.set(true)
    if (this.playgroundCopyResetTimer) window.clearTimeout(this.playgroundCopyResetTimer)
    this.playgroundCopyResetTimer = window.setTimeout(() => this.playgroundCopied.set(false), 1800)
  }

  async copyInstall(): Promise<void> {
    await navigator.clipboard.writeText('npm install @ailabs/design-system')
    this.copied.set(true)
    window.setTimeout(() => this.copied.set(false), 1800)
  }

  async copyColor(value: string, key: string): Promise<void> {
    await navigator.clipboard.writeText(value)
    this.copiedColorKey.set(key)
    if (this.copyResetTimer) window.clearTimeout(this.copyResetTimer)
    this.copyResetTimer = window.setTimeout(() => this.copiedColorKey.set(''), 1800)
  }
}
