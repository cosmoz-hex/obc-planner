import {Directive} from '@angular/core';
import {WaControlDirective} from './wa-control.directive';

/**
 * Value accessor pour `<wa-select>` (sélection simple), utilisable via `[formField]`.
 * Conversion identité (T = string) héritée de la base.
 *
 * `<wa-select>` n'a pas d'état `readonly` natif : on le rabat sur `disabled`.
 */
@Directive({
  selector: 'wa-select[formField]',
  standalone: true,
  host: {
    '(change)': 'raw.set(readEventValue($event))',
    '(wa-clear)': 'raw.set("")',
    '(wa-after-hide)': 'touch.emit()'
  }
})
export class WaSelectControlDirective extends WaControlDirective<string> {

  protected override reflectStates(element: HTMLElement): void {
    this.reflect(element, 'disabled', this.disabled() || this.readonly());
    this.reflect(element, 'required', this.required());
    this.reflect(element, 'aria-invalid', this.invalid());
  }
}
