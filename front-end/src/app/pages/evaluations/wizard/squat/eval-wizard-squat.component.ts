import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {FormField, applyEach, disabled, form} from '@angular/forms/signals';
import {EvalCategorie, EvalDetail} from '../../../../models/eval-detail.model';
import {EvalWizardStep} from '../eval-wizard-step';
import {EvalRatingComponent} from '../eval-rating.component';
import {WaNumberInputControlDirective} from '../../../../directives/wa-forms/wa-number-input-control.directive';
import {SanitizeHtmlPipe} from '../../../../pipes/sanitize-html.pipe';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/input/input.js';

/** Marge appliquée autour de l'attendu pour borner Faible / Moyen / Fort. */
const MARGIN = 0.05;

/**
 * Définition statique d'une ligne du tableau squat.
 *
 * `factor` est un pourcentage appliqué à l'épaulé de référence réalisé pour
 * obtenir la valeur attendue de la variante.
 */
interface SquatRow {
  /** `exercice_code` stocké dans `eval_details`. */
  code: string;
  /** Clé i18n du libellé. */
  label: string;
  /** Multiplicateur appliqué à l'épaulé de référence réalisé. */
  factor: number;
}

/** Bornes dynamiques d'une ligne (en kg), `null` tant que la base manque. */
interface SquatThreshold {
  low: number | null;
  expected: number | null;
  high: number | null;
}

/**
 * Étape 6 du wizard d'évaluation : Squat (catégorie {@link EvalCategorie}
 * `TECH`). Implémente {@link EvalWizardStep}.
 *
 * Même patron que les étapes Arraché / Épaulé / Jeté, à une nuance près : les
 * squats (flexion nuque / clavicule) attendent un pourcentage de l'**épaulé**.
 * La première ligne du modèle est donc l'**épaulé de référence** (sans rating,
 * base de calcul). Les **libellés** des seuils Faible / Moyen / Fort sont
 * **dynamiques** (±5% de l'attendu, arrondi à l'entier) ; le résultat (-1/0/1)
 * reste choisi par le coach.
 *
 * Désactivation en cascade : les variantes sont saisissables une fois l'épaulé
 * de référence renseigné.
 */
@Component({
  selector: 'app-eval-wizard-squat',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, SanitizeHtmlPipe, FormField, WaNumberInputControlDirective, EvalRatingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-squat.component.html',
  providers: [{provide: EvalWizardStep, useExisting: EvalWizardSquatComponent}]
})
export class EvalWizardSquatComponent implements EvalWizardStep {

  private static readonly CATEGORIE: EvalCategorie = 'TECH';

  /** Index de la ligne épaulé de référence (base des variantes). */
  private static readonly CLEAN_INDEX = 0;

  /**
   * Les lignes du tableau squat (libellés et pourcentages du PDF), alignées sur
   * le modèle `EvalDetail[]` : l'épaulé de référence en tête, puis les flexions
   * exprimées en pourcentage de l'épaulé réalisé.
   */
  protected readonly exercices: readonly SquatRow[] = [
    {code: 'exercice.clean.tech.simple',  label: 'evaluations.wizard.squat.reference', factor: 1.00},
    {code: 'exercice.squat.back.simple',  label: 'exercice.squat.back.simple',  factor: 1.35},
    {code: 'exercice.squat.back.double',  label: 'exercice.squat.back.double',  factor: 1.28},
    {code: 'exercice.squat.back.triple',  label: 'exercice.squat.back.triple',  factor: 1.22},
    {code: 'exercice.squat.front.simple', label: 'exercice.squat.front.simple', factor: 1.14},
    {code: 'exercice.squat.front.double', label: 'exercice.squat.front.double', factor: 1.08},
    {code: 'exercice.squat.front.triple', label: 'exercice.squat.front.triple', factor: 1.03}
  ];

  /** Modèle du form : une ligne eval_details par question (alignée sur `exercices`). */
  private readonly model = signal<EvalDetail[]>(this.emptyModel());

  /**
   * Signal Form sur le modèle `EvalDetail[]` : pilote `wa-input` (realValue) et
   * `app-eval-rating` (result) via `[formField]`. L'épaulé de référence est
   * toujours saisissable ; une variante est verrouillée tant que l'épaulé
   * réalisé est vide.
   */
  protected readonly squatForm = form(this.model, (path) => {
    // Désactive la ligne entière (realValue + result) tant que sa base manque.
    // Le contexte d'item porte l'index ; disabled sur l'item se propage aux sous-champs.
    applyEach(path, (rowPath) => {
      disabled(rowPath, {when: (ctx) => this.isRowDisabled(ctx.index())});
    });
  });

  /** Épaulé de référence réalisé (base des variantes). */
  private readonly cleanRealised = computed<number | null>(
    () => this.model()[EvalWizardSquatComponent.CLEAN_INDEX]?.realValue ?? null
  );

  /**
   * Bornes dynamiques par ligne (en kg, arrondies) : `low` = attendu −5%,
   * `expected`, `high` = attendu +5%. `null` pour l'épaulé de référence (pas de
   * rating) et tant que la base n'est pas saisie. Les libellés sont composés en
   * template.
   */
  protected readonly thresholds = computed<SquatThreshold[]>(() =>
    this.exercices.map((row, i) => {
      if (i === EvalWizardSquatComponent.CLEAN_INDEX) {
        return {low: null, expected: null, high: null};
      }
      const base = this.cleanRealised();
      if (base == null) {
        return {low: null, expected: null, high: null};
      }
      const expected = Math.round(base * row.factor);
      return {
        low: Math.round(expected * (1 - MARGIN)),
        expected,
        high: Math.round(expected * (1 + MARGIN))
      };
    })
  );

  /** Contrat {@link EvalWizardStep} : pas de contrôle, l'étape est toujours valide. */
  readonly valid = signal(true).asReadonly();

  /** Contrat {@link EvalWizardStep} : le modèle est déjà des lignes eval_details. */
  readonly value = computed<readonly EvalDetail[]>(() => this.model());

  /** Contrat {@link EvalWizardStep} : réinitialise le formulaire. */
  reset(): void {
    this.model.set(this.emptyModel());
  }

  /** Une variante est verrouillée tant que l'épaulé de référence n'est pas saisi. */
  private isRowDisabled(index: number): boolean {
    if (index === EvalWizardSquatComponent.CLEAN_INDEX) {
      return false;
    }
    return this.cleanRealised() == null;
  }

  private emptyModel(): EvalDetail[] {
    return this.exercices.map((row) => ({
      evalCategorie: EvalWizardSquatComponent.CATEGORIE,
      exerciceCode: row.code,
      realValue: null,
      result: null
    }));
  }
}
