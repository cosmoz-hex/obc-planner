import {ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {SafeHtml} from '@angular/platform-browser';
import {EvalResult} from '../../../../models/eval-detail.model';

/**
 * Contrôle de résultat d'une question d'évaluation : trois radios
 * Faible(-1) / Moyen(0) / Fort(1), chacun affichant son repère de seuil.
 *
 * Implémente {@link FormValueControl} : exposé via `value` (`model`), il se
 * branche directement sur un champ Signal Forms avec `[formField]` — pas besoin
 * de `[checked]`/`(change)` ni de handlers côté étape.
 *
 * L'hôte est en `display:contents` : les trois `<label>` deviennent des cellules
 * directes du grid de l'étape. Les repères `low`/`mid`/`high` sont fournis déjà
 * assainis (`SafeHtml`) par l'appelant.
 */
@Component({
  selector: 'app-eval-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {class: 'contents'},
  templateUrl: './eval-rating.component.html'
})
export class EvalRatingComponent implements FormValueControl<EvalResult | null> {

  /** Repères de seuil (déjà assainis par l'appelant) affichés sur chaque radio. */
  readonly low = input.required<SafeHtml>();
  readonly mid = input.required<SafeHtml>();
  readonly high = input.required<SafeHtml>();

  /** Valeur du champ (contrat FormValueControl) : résultat -1/0/1 ou null. */
  readonly value = model<EvalResult | null>(null);

  /** Nom unique de groupe pour isoler ces 3 radios des autres lignes. */
  protected readonly group = `eval-rating-${EvalRatingComponent.seq++}`;
  private static seq = 0;
}
