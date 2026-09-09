import {formatDate} from '@angular/common';
import {inject, Pipe, PipeTransform} from '@angular/core';
import {LocaleService} from '../services/locale.service';

/**
 * Formate une date selon la langue ngx-translate active.
 *
 * Le pipe est impur afin qu'un usage dans un template soit réévalué lorsque
 * la langue change sans que la valeur de date soit modifiée.
 */
@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  /** À lire dans les `computed` qui construisent des formatters impératifs. */
  readonly currentLocale = this.localeService.locale;

  transform(
    value: string | number | Date | null | undefined,
    format = 'mediumDate',
    timezone?: string
  ): string | null {
    if (value == null || value === '') {
      return null;
    }
    return formatDate(value, format, this.currentLocale(), timezone);
  }
}
