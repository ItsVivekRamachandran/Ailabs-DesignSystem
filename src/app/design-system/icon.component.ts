import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { materialIcons, MaterialIconName } from './material-icons'
@Component({
  selector: 'ds-icon', standalone: true,
  host: { class: 'ds-icon', 'aria-hidden': 'true' },
  template: `<svg [attr.viewBox]="icon.viewBox" focusable="false" aria-hidden="true">@for (path of icon.paths; track $index) { <path [attr.d]="path" /> }</svg>`,
  styles: [':host{display:inline-flex;flex:none;width:24px;height:24px;vertical-align:middle}svg{display:block;width:100%;height:100%;fill:currentColor;stroke:none}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input({ required: true }) name: MaterialIconName = 'calendar_month'
  get icon() { return materialIcons[this.name] || materialIcons.calendar_month }
}
