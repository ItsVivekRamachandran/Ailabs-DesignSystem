import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { colorRamps, radii, semanticColorGroups, spacing } from '../design-system/tokens'
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
export class AppComponent {
  readonly copied = signal(false)
  readonly colorRamps = colorRamps
  readonly semanticColorGroups = semanticColorGroups
  readonly spacing = spacing
  readonly radiusTokens = Object.entries(radii).map(([name, value]) => ({ name, value }))

  async copyInstall(): Promise<void> {
    await navigator.clipboard.writeText('npm install @ailabs/design-system')
    this.copied.set(true)
    window.setTimeout(() => this.copied.set(false), 1800)
  }
}
