import {Directive, ElementRef, effect, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FORM_FIELD} from '@angular/forms/signals';
import {TranslateService} from '@ngx-translate/core';

/**
 * Affiche automatiquement le message d'erreur d'un champ Signal Forms dans le
 * `hint` du composant WebAwesome, sans câblage par champ ni par écran.
 *
 * Co-localisée avec `[formField]` : elle récupère l'état du champ via le token
 * {@link FORM_FIELD}. Quand le champ est **touché ET invalide**, elle affiche le
 * premier message d'erreur traduit ; sinon elle restaure le `hint` d'aide initial
 * éventuellement présent sur l'élément.
 *
 * Le message provient des validateurs du schéma (ex. `required(..., {message:
 * 'clé.i18n'})`) et est traduit via ngx-translate (réactif au changement de langue).
 * La coloration visuelle de l'erreur est gérée globalement par les classes de
 * statut `ng-*` (voir `provideSignalFormsConfig` + styles.css).
 */
@Directive({
  selector: 'wa-input[formField], wa-select[formField], wa-textarea[formField]',
  standalone: true
})
export class WaFieldErrorDirective {

  private readonly formField = inject(FORM_FIELD);
  private readonly translate = inject(TranslateService);
  private readonly host = inject<ElementRef<HTMLElement & { hint: string }>>(ElementRef);

  /** Hint d'aide statique initial (à restaurer quand il n'y a pas d'erreur). */
  private readonly baseHint = this.host.nativeElement.hint ?? '';

  /** Langue courante, en signal, pour retraduire le message au changement de langue. */
  private readonly lang = toSignal(this.translate.onLangChange, {initialValue: null});

  constructor() {
    effect(() => {
      this.lang(); // dépendance : retraduit quand la langue change
      const state = this.formField.state();
      const showError = state.touched() && state.invalid();
      const key = showError ? state.errors().find((e) => e.message)?.message : undefined;

      this.host.nativeElement.hint = key ? this.translate.instant(key) : this.baseHint;
    });
  }
}
