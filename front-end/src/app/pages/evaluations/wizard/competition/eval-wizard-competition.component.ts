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
 * Étape 7 du wizard d'évaluation : Réussite en compétition (catégorie
 * {@link EvalCategorie} `TECH`). Implémente {@link EvalWizardStep}.
 *
 * Même patron que les étapes Vitesse / Force : le modèle du Signal Form est
 * directement un `EvalDetail[]` (une ligne `eval_details` par question, alignée
 * sur {@link exercices} par index), donc `value()` expose le modèle tel quel.
 * Il n'y a pas de référentiel ni de base de calcul : la valeur réalisée est un
 * **pourcentage de réussite** saisi par le coach sur les compétitions récentes,
 * et le résultat (-1/0/1) est choisi au regard des seuils statiques affichés.
 * `reset()` remet le modèle à son état vide.
 */
@Component({
  selector: 'app-eval-wizard-competition',
  standalone: true,
  imports: [TranslatePipe, SanitizeHtmlPipe, FormField, WaNumberInputControlDirective, EvalRatingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-competition.component.html',
  providers: [{provide: EvalWizardStep, useExisting: EvalWizardCompetitionComponent}]
})
export class EvalWizardCompetitionComponent implements EvalWizardStep {

  private static readonly CATEGORIE: EvalCategorie = 'TECH';

  /**
   * Les 4 mesures du tableau réussite en compétition (seuils issus du PDF
   * d'évaluation). Les lignes « 1er essai » et « global » n'ont pas les mêmes
   * seuils ; l'ordre d'affichage suit la demande : Arraché (1er essai), Arraché
   * (global), Épaulé (1er essai), Épaulé (global).
   */
  protected readonly exercices: readonly EvalMeasureRow[] = [
    {code: 'eval.competition.snatch.rate-first',  label: 'evaluations.wizard.competition.items.snatchFirst',  low: '< 65%', mid: '65–80%', high: '> 80%'},
    {code: 'eval.competition.snatch.rate-global', label: 'evaluations.wizard.competition.items.snatchGlobal', low: '< 50%', mid: '50–70%', high: '> 70%'},
    {code: 'eval.competition.cj.rate-first',      label: 'evaluations.wizard.competition.items.cjFirst',      low: '< 65%', mid: '65–80%', high: '> 80%'},
    {code: 'eval.competition.cj.rate-global',     label: 'evaluations.wizard.competition.items.cjGlobal',     low: '< 50%', mid: '50–70%', high: '> 70%'}
  ];

  /** Modèle du form : une ligne eval_details par question (alignée sur `exercices`). */
  private readonly model = signal<EvalDetail[]>(this.emptyModel());

  /** Signal Form sur le modèle : pilote les contrôles via `[formField]`. */
  protected readonly competitionForm = form(this.model);

  /** Contrat {@link EvalWizardStep} : validité native du form. */
  readonly valid = computed(() => this.competitionForm().valid());

  /** Contrat {@link EvalWizardStep} : le modèle est déjà des lignes eval_details. */
  readonly value = computed<readonly EvalDetail[]>(() => this.model());

  /** Contrat {@link EvalWizardStep} : réinitialise le formulaire. */
  reset(): void {
    this.model.set(this.emptyModel());
  }

  private emptyModel(): EvalDetail[] {
    return this.exercices.map((row) => ({
      evalCategorie: EvalWizardCompetitionComponent.CATEGORIE,
      exerciceCode: row.code,
      realValue: null,
      result: null
    }));
  }
}
