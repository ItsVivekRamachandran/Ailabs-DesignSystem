import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

let nextCheckboxId = 0

@Component({
  selector: 'ds-checkbox',
  standalone: true,
  host: { class: 'ds-check' },
  template: `
    <label class="ds-check__label" [class.ds-check__label--disabled]="disabled" [for]="inputId">
      <input class="ds-check__input" [id]="inputId" type="checkbox" [checked]="checked" [disabled]="disabled" [attr.aria-checked]="indeterminate ? 'mixed' : checked" (change)="toggle($event)" />
      <span class="ds-check__box" [class.ds-check__box--checked]="checked" [class.ds-check__box--mixed]="indeterminate" aria-hidden="true">
        @if (indeterminate) { <span class="ds-check__mixed"></span> }
        @else if (checked) { <span class="ds-check__tick">✓</span> }
      </span>
      <span><ng-content /></span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  @Input() checked = false
  @Input() indeterminate = false
  @Input() disabled = false
  @Output() readonly checkedChange = new EventEmitter<boolean>()
  readonly inputId = `ds-checkbox-${++nextCheckboxId}`

  toggle(event: Event): void {
    this.checked = (event.target as HTMLInputElement).checked
    this.indeterminate = false
    this.checkedChange.emit(this.checked)
  }
}
