import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

let nextSwitchId = 0

@Component({
  selector: 'ds-switch',
  standalone: true,
  host: { class: 'ds-switch' },
  template: `
    <label class="ds-switch__label" [class.ds-switch__label--disabled]="disabled" [for]="inputId">
      <input class="ds-switch__input" [id]="inputId" type="checkbox" role="switch" [checked]="checked" [disabled]="disabled" (change)="toggle($event)" />
      <span class="ds-switch__track" aria-hidden="true"><span class="ds-switch__thumb"></span></span>
      <span><ng-content /></span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  @Input() checked = false
  @Input() disabled = false
  @Output() readonly checkedChange = new EventEmitter<boolean>()
  readonly inputId = `ds-switch-${++nextSwitchId}`

  toggle(event: Event): void {
    this.checked = (event.target as HTMLInputElement).checked
    this.checkedChange.emit(this.checked)
  }
}
