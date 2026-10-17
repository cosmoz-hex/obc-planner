import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {FormField, form} from '@angular/forms/signals';
import {EvalCategorie, EvalDetail, EvalMeasureRow} from '../../../../models/eval-detail.model';
import {EvalWizardStep, mergeDetails} from '../eval-wizard-step';
import {EvalRatingComponent} from '../rating/eval-rating.component';
import {WaNumberInputControlDirective} from '../../../../directives/wa-forms/wa-number-input-control.directive';
import {SanitizeHtmlPipe} from '../../../../pipes/sanitize-html.pipe';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/input/input.js';

/**
 * Étape 2 du wizard d'évaluation : Force (catégorie {@link EvalCategorie}
 * `STRENGTH`). Implémente {@link EvalWizardStep}.
 *
 * Même patron que l'étape Vitesse : le modèle du Signal Form est directement un
 * `EvalDetail[]` (une ligne `eval_details` par question, alignée sur
 * {@link exercices} par index), donc `value()` expose le modèle tel quel. Les
 * deux contrôles sont entièrement pilotés par le form via `[formField]` :
 * `wa-input` (valeur réalisée, `number`) et `app-eval-rating` (résultat
 * -1/0/1). `reset()` remet le modèle à son état vide.
 */
@Component({
  selector: 'app-eval-wizard-strength',
  standalone: true,
  imports: [TranslatePipe, SanitizeHtmlPipe, FormField, WaNumberInputControlDirective, EvalRatingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-strength.component.html',
  providers: [{provide: EvalWizardStep, useExisting: EvalWizardStrengthComponent}]
})
export class EvalWizardStrengthComponent implements EvalWizardStep {

  private static readonly CATEGORIE: EvalCategorie = 'STRENGTH';

  /** Les 5 mesures du tableau force (repères issus du PDF d'évaluation). */
  protected readonly exercices: readonly EvalMeasureRow[] = [
    {code: 'eval.strength.front-squat-cj', label: 'evaluations.wizard.strength.items.frontSquatCj', low: '< 95%',  mid: '95–105%',  high: '> 105%'},
    {code: 'eval.strength.back-squat-cj',  label: 'evaluations.wizard.strength.items.backSquatCj',  low: '< 115%', mid: '115–125%', high: '> 125%'},
    {code: 'eval.strength.pull-snatch',    label: 'evaluations.wizard.strength.items.pullSnatch',    low: '< 105%', mid: '105–120%', high: '> 120%'},
    {code: 'eval.strength.pull-cj',        label: 'evaluations.wizard.strength.items.pullCj',        low: '< 115%', mid: '115–125%', high: '> 125%'},
    {code: 'eval.strength.grip',           label: 'evaluations.wizard.strength.items.grip',          low: '< 70% BW (H)<br/>< 60% BW (F)', mid: '70–90% BW (H)<br/>60–80% BW (F)', high: '> 90% BW (H)<br/>> 80% BW (F)'}
  ];

  /** Modèle du form : une ligne eval_details par question (alignée sur `exercices`). */
  private readonly model = signal<EvalDetail[]>(this.emptyModel());

  /** Signal Form sur le modèle : pilote les contrôles via `[formField]`. */
  protected readonly strengthForm = form(this.model);

  /** Contrat {@link EvalWizardStep} : validité native du form. */
  readonly valid = computed(() => this.strengthForm().valid());

  /** Contrat {@link EvalWizardStep} : le modèle est déjà des lignes eval_details. */
  readonly value = computed<readonly EvalDetail[]>(() => this.model());

  /** Contrat {@link EvalWizardStep} : réinitialise le formulaire. */
  reset(): void {
    this.model.set(this.emptyModel());
  }

  /** Contrat {@link EvalWizardStep} : pré-remplit les mesures (édition). */
  load(details: readonly EvalDetail[]): void {
    this.model.set(mergeDetails(this.model(), details));
  }

  private emptyModel(): EvalDetail[] {
    return this.exercices.map((row) => ({
      evalCategorie: EvalWizardStrengthComponent.CATEGORIE,
      exerciceCode: row.code,
      realValue: null,
      result: null
    }));
  }
}
