import {Directive} from '@angular/core';
import {WaControlDirective} from './wa-control.directive';

/**
 * Value accessor pour les composants WebAwesome de saisie texte
 * (`<wa-input>` hors `type="number"`, `<wa-textarea>`), utilisable via
 * `[formField]`. Conversion identité (T = string) héritée de la base.
 */
@Directive({
  selector: 'wa-input[formField]:not([type="number"]), wa-textarea[formField]',
  standalone: true,
  host: {
    '(input)': 'raw.set(readEventValue($event))',
    '(blur)': 'touch.emit()'
  }
})
export class WaInputControlDirective extends WaControlDirective<string> {}
