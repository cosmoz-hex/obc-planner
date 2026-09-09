import {inject, Injectable} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {TranslateService} from '@ngx-translate/core';
import {map} from 'rxjs';

/**
 * Expose la locale Angular correspondant à la langue ngx-translate active.
 * Contrairement à LOCALE_ID, ce signal évolue lors d'un changement de langue.
 */
@Injectable({providedIn: 'root'})
export class LocaleService {
  private readonly translate = inject(TranslateService);

  readonly locale = toSignal(
    this.translate.onLangChange.pipe(map(({lang}) => this.toAngularLocale(lang))),
    {
      initialValue: this.toAngularLocale(
        this.translate.getCurrentLang() ?? this.translate.getBrowserLang() ?? 'en'
      )
    }
  );

  private toAngularLocale(lang: string): string {
    return lang.toLowerCase().startsWith('fr') ? 'fr-FR' : 'en-US';
  }
}
