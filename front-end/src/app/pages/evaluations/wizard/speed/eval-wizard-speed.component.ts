import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {FormField, form} from '@angular/forms/signals';
import {EvalCategorie, EvalDetail} from '../../../../models/eval-detail.model';
import {EvalWizardStep, mergeDetails} from '../eval-wizard-step';
import {EvalRatingComponent} from '../rating/eval-rating.component';
import {WaNumberInputControlDirective} from '../../../../directives/wa-forms/wa-number-input-control.directive';
import {SanitizeHtmlPipe} from '../../../../pipes/sanitize-html.pipe';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/input/input.js';

/** Métadonnées d'affichage d'une question (le modèle, lui, est un EvalDetail). */
interface SpeedRow {
  /** `exercice_code` de la question. */
  code: string;
  /** Clé i18n du libellé. */
  label: string;
  /** Repères affichés sur les radios Faible / Moyen / Fort. */
  low: string;
  mid: string;
  high: string;
}

/**
 * Étape 1 du wizard d'évaluation : Vitesse (catégorie {@link EvalCategorie}
 * `STRENGTH`). Implémente {@link EvalWizardStep}.
 *
 * Le modèle du Signal Form est directement un `EvalDetail[]` (une ligne
 * `eval_details` par question, alignée sur {@link exercices} par index), donc
 * `value()` expose le modèle tel quel. Les deux contrôles sont entièrement
 * pilotés par le form via `[formField]` : `app-eval-number` (valeur réalisée,
 * `number`) et `app-eval-rating` (résultat -1/0/1). `reset()` remet le modèle à
 * son état vide — aucun handler de saisie dans l'étape.
 */
@Component({
  selector: 'app-eval-wizard-speed',
  standalone: true,
  imports: [TranslatePipe, SanitizeHtmlPipe, FormField, WaNumberInputControlDirective, EvalRatingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-speed.component.html',
  providers: [{provide: EvalWizardStep, useExisting: EvalWizardSpeedComponent}]
})
export class EvalWizardSpeedComponent implements EvalWizardStep {

  private static readonly CATEGORIE: EvalCategorie = 'STRENGTH';

  /** Les 6 mesures du tableau vitesse (repères issus du PDF d'évaluation). */
  protected readonly exercices: readonly SpeedRow[] = [
    {code: 'eval.strength.speed.jump-elan',    label: 'evaluations.wizard.speed.items.jumpElan',   low: '< 45 cm (H)<br/>< 35 cm (F)', mid: '45–55 cm (H)<br/>35–45 cm (F)', high: '> 55 cm (H)<br/>> 45 cm (F)'},
    {code: 'eval.strength.speed.jump-static',  label: 'evaluations.wizard.speed.items.jumpStatic', low: '< 35 cm (H)<br/>< 25 cm (F)', mid: '35–45 cm (H)<br/>25–35 cm (F)', high: '> 45 cm (H)<br/>> 35 cm (F)'},
    {code: 'eval.strength.speed.squat-30',     label: 'evaluations.wizard.speed.items.squat30',    low: '< 0,9 m/s',            mid: '0,9–1,0 m/s',           high: '> 1,0 m/s'},
    {code: 'eval.strength.speed.squat-50',     label: 'evaluations.wizard.speed.items.squat50',    low: '< 0,8 m/s',            mid: '0,8–0,9 m/s',           high: '> 0,9 m/s'},
    {code: 'eval.strength.speed.squat-70',     label: 'evaluations.wizard.speed.items.squat70',    low: '< 0,5 m/s',            mid: '0,5–0,65 m/s',          high: '> 0,65 m/s'},
    {code: 'eval.strength.speed.high-pull-80', label: 'evaluations.wizard.speed.items.highPull80', low: '< 1,9 m/s',            mid: '1,9–2,1 m/s',           high: '> 2,1 m/s'}
  ];

  /** Modèle du form : une ligne eval_details par question (alignée sur `exercices`). */
  private readonly model = signal<EvalDetail[]>(this.emptyModel());

  /** Signal Form sur le modèle : pilote les contrôles via `[formField]`. */
  protected readonly speedForm = form(this.model);

  /** Contrat {@link EvalWizardStep} : validité native du form. */
  readonly valid = computed(() => this.speedForm().valid());

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
      evalCategorie: EvalWizardSpeedComponent.CATEGORIE,
      exerciceCode: row.code,
      realValue: null,
      result: null
    }));
  }
}
