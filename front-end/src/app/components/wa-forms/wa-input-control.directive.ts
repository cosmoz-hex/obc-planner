import {Directive} from '@angular/core';
import {WaControlDirective} from './wa-control.directive';
import {waEventValue} from './wa-event-value';

/**
 * Value accessor pour les composants WebAwesome de saisie texte
 * (`<wa-input>`, `<wa-textarea>`), utilisable via `[formField]`.
 */
@Directive({
  selector: 'wa-input[formField], wa-textarea[formField]',
  standalone: true,
  host: {
    '(input)': 'value.set(readEventValue($event))',
    '(blur)': 'touch.emit()'
  }
})
export class WaInputControlDirective extends WaControlDirective {
  protected readEventValue = waEventValue;
}
