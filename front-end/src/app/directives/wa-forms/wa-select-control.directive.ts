import {Directive} from '@angular/core';
import {WaControlDirective} from './wa-control.directive';
import {waEventValue} from './wa-event-value';

/**
 * Value accessor pour `<wa-select>` (sélection simple), utilisable via `[formField]`.
 *
 * `<wa-select>` n'a pas d'état `readonly` natif : on le rabat sur `disabled`.
 */
@Directive({
  selector: 'wa-select[formField]',
  standalone: true,
  host: {
    '(change)': 'value.set(readEventValue($event))',
    '(wa-clear)': 'value.set("")',
    '(wa-after-hide)': 'touch.emit()'
  }
})
export class WaSelectControlDirective extends WaControlDirective {
  protected readEventValue = waEventValue;

  protected override reflectStates(element: HTMLElement): void {
    this.reflect(element, 'disabled', this.disabled() || this.readonly());
    this.reflect(element, 'required', this.required());
    this.reflect(element, 'aria-invalid', this.invalid());
  }
}
