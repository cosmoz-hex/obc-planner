import {Directive} from '@angular/core';
import {type ParseResult} from '@angular/forms/signals';
import {WaControlDirective} from './wa-control.directive';

/**
 * Value accessor pour `<wa-input type="number">`, utilisable via `[formField]`.
 *
 * Le web component n'expose que des `string` : on surcharge {@link parse} /
 * {@link format} pour se brancher sur un champ Signal Forms typé `number | null`.
 */
@Directive({
  selector: 'wa-input[formField][type="number"]',
  standalone: true,
  host: {
    '(input)': 'raw.set(readEventValue($event))',
    '(blur)': 'touch.emit()'
  }
})
export class WaNumberInputControlDirective extends WaControlDirective<number | null> {

  protected override parse(raw: string): ParseResult<number | null> {
    const trimmed = (raw ?? '').trim();
    if (trimmed === '') {
      return {value: null};
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed)
      ? {error: {kind: 'parse', message: `${raw} n'est pas un nombre`}}
      : {value: parsed};
  }

  protected override format(value: number | null): string {
    return value == null ? '' : String(value);
  }
}
