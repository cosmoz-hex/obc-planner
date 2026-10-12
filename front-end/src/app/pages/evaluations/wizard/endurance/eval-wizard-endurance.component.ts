import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {FormField, form} from '@angular/forms/signals';
import {EvalCategorie, EvalDetail, EvalMeasureRow} from '../../../../models/eval-detail.model';
import {EvalWizardStep} from '../eval-wizard-step';
import {EvalRatingComponent} from '../rating/eval-rating.component';
import {WaNumberInputControlDirective} from '../../../../directives/wa-forms/wa-number-input-control.directive';
import {SanitizeHtmlPipe} from '../../../../pipes/sanitize-html.pipe';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/input/input.js';

/**
 * Étape 8 du wizard d'évaluation : Endurance / Récupération (catégorie
 * {@link EvalCategorie} `CARDIO`). Implémente {@link EvalWizardStep}.
 *
 * Même patron que les étapes Vitesse / Force : le modèle du Signal Form est
 * directement un `EvalDetail[]` (une ligne `eval_details` par mesure, alignée
 * sur {@link exercices} par index), donc `value()` expose le modèle tel quel.
 * Les deux protocoles cardio conservés (1 et 2) sont ramenés à la même
 * structure que les autres lignes : la valeur réalisée est le **temps de
 * récupération en minutes**, et le résultat (-1/0/1) est choisi au regard des
 * repères statiques affichés. Les unités varient d'une ligne à l'autre (min,
 * rep, %, s) ; elles sont rappelées dans le libellé de la mesure. `reset()`
 * remet le modèle à son état vide.
 */
@Component({
  selector: 'app-eval-wizard-endurance',
  standalone: true,
  imports: [TranslatePipe, SanitizeHtmlPipe, FormField, WaNumberInputControlDirective, EvalRatingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-endurance.component.html',
  providers: [{provide: EvalWizardStep, useExisting: EvalWizardEnduranceComponent}]
})
export class EvalWizardEnduranceComponent implements EvalWizardStep {

  private static readonly CATEGORIE: EvalCategorie = 'CARDIO';

  /**
   * Les mesures du tableau endurance (repères issus du PDF d'évaluation).
   * Protocoles cardio : seuls 1 et 2 sont conservés, le réalisé est le temps de
   * récupération (min). Les autres lignes rappellent leur unité dans le libellé.
   */
  protected readonly exercices: readonly EvalMeasureRow[] = [
    {code: 'eval.cardio.protocol-1',        label: 'evaluations.wizard.endurance.items.protocol1',   low: '< 12 min', mid: '12–20 min', high: '> 20 min'},
    {code: 'eval.cardio.protocol-2',        label: 'evaluations.wizard.endurance.items.protocol2',   low: '< 8 min',  mid: '8–15 min',  high: '> 15 min'},
    {code: 'eval.cardio.max-rep-squat',     label: 'evaluations.wizard.endurance.items.maxRepSquat', low: '< 10',     mid: '10–16',     high: '> 16'},
    {code: 'eval.cardio.max-rep-pull-cj',   label: 'evaluations.wizard.endurance.items.maxRepPullCj', low: '< 10',    mid: '10–16',     high: '> 16'},
    {code: 'eval.cardio.snatch-x3',         label: 'evaluations.wizard.endurance.items.snatchX3',    low: '< 85%',    mid: '85–90%',    high: '> 90%'},
    {code: 'eval.cardio.snatch-x2',         label: 'evaluations.wizard.endurance.items.snatchX2',    low: '< 90%',    mid: '90–95%',    high: '> 95%'},
    {code: 'eval.cardio.cj-x3',             label: 'evaluations.wizard.endurance.items.cjX3',        low: '< 85%',    mid: '85–90%',    high: '> 90%'},
    {code: 'eval.cardio.cj-x2',             label: 'evaluations.wizard.endurance.items.cjX2',        low: '< 90%',    mid: '90–95%',    high: '> 95%'},
    {code: 'eval.cardio.plank',             label: 'evaluations.wizard.endurance.items.plank',       low: '< 1 min',  mid: '1–3 min',   high: '> 3 min'},
    {code: 'eval.cardio.plank-50',          label: 'evaluations.wizard.endurance.items.plank50',     low: '< 30 s',   mid: '30 s–1 min', high: '> 1 min'},
    {code: 'eval.cardio.plank-100',         label: 'evaluations.wizard.endurance.items.plank100',    low: '< 15 s',   mid: '15–45 s',   high: '> 45 s'}
  ];

  /** Modèle du form : une ligne eval_details par mesure (alignée sur `exercices`). */
  private readonly model = signal<EvalDetail[]>(this.emptyModel());

  /** Signal Form sur le modèle : pilote les contrôles via `[formField]`. */
  protected readonly enduranceForm = form(this.model);

  /** Contrat {@link EvalWizardStep} : validité native du form. */
  readonly valid = computed(() => this.enduranceForm().valid());

  /** Contrat {@link EvalWizardStep} : le modèle est déjà des lignes eval_details. */
  readonly value = computed<readonly EvalDetail[]>(() => this.model());

  /** Contrat {@link EvalWizardStep} : réinitialise le formulaire. */
  reset(): void {
    this.model.set(this.emptyModel());
  }

  private emptyModel(): EvalDetail[] {
    return this.exercices.map((row) => ({
      evalCategorie: EvalWizardEnduranceComponent.CATEGORIE,
      exerciceCode: row.code,
      realValue: null,
      result: null
    }));
  }
}
