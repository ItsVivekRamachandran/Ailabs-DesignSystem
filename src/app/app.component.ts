import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core'
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
  readonly copied = signal(false)
  readonly copiedColorKey = signal('')
  readonly activeSection = signal('overview')
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

  ngAfterViewInit(): void {
    const sectionIds = ['overview', 'colors', 'variables', 'foundations', 'components']
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
  }

  selectSection(sectionId: string, event?: Event): void {
    event?.preventDefault()
    this.activeSection.set(sectionId)
    window.history.replaceState(null, '', `#${sectionId}`)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
