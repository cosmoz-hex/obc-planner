import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {applyEach, disabled, form, FormField} from '@angular/forms/signals';
import {EvalCategorie, EvalDetail} from '../../../../models/eval-detail.model';
import {EvalWizardStep} from '../eval-wizard-step';
import {EvalRatingComponent} from '../rating/eval-rating.component';
import {WaNumberInputControlDirective} from '../../../../directives/wa-forms/wa-number-input-control.directive';
import {SanitizeHtmlPipe} from '../../../../pipes/sanitize-html.pipe';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/input/input.js';

/** Marge appliquée autour de l'attendu pour borner Faible / Moyen / Fort. */
const MARGIN = 0.05;

/**
 * Définition statique d'une ligne du tableau jeté.
 *
 * `factor` est un pourcentage appliqué au jeté de référence réalisé pour obtenir
 * la valeur attendue de la variante.
 */
interface JerkRow {
  /** `exercice_code` stocké dans `eval_details`. */
  code: string;
  /** Clé i18n du libellé. */
  label: string;
  /** Multiplicateur appliqué au jeté de référence réalisé. */
  factor: number;
}

/** Bornes dynamiques d'une ligne (en kg), `null` tant que la base manque. */
interface JerkThreshold {
  low: number | null;
  expected: number | null;
  high: number | null;
}

/**
 * Étape 5 du wizard d'évaluation : Technique sur le jeté (catégorie
 * {@link EvalCategorie} `TECH`). Implémente {@link EvalWizardStep}.
 *
 * Même patron que les étapes Arraché / Épaulé : le modèle du Signal Form est un
 * `EvalDetail[]`, la première ligne est le **jeté de référence** (sans rating,
 * base des variantes). Les **libellés** des seuils Faible / Moyen / Fort sont
 * **dynamiques** : chaque variante attend un pourcentage du jeté réalisé ; marge
 * de ±5% autour de l'attendu (arrondi à l'entier). Le résultat (-1/0/1) reste
 * choisi par le coach.
 *
 * Désactivation en cascade : les variantes sont saisissables une fois le jeté de
 * référence renseigné.
 */
@Component({
  selector: 'app-eval-wizard-jerk',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, SanitizeHtmlPipe, FormField, WaNumberInputControlDirective, EvalRatingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-jerk.component.html',
  providers: [{provide: EvalWizardStep, useExisting: EvalWizardJerkComponent}]
})
export class EvalWizardJerkComponent implements EvalWizardStep {

  private static readonly CATEGORIE: EvalCategorie = 'TECH';

  /** Index de la ligne jeté de référence (base des variantes). */
  private static readonly JERK_INDEX = 0;

  /**
   * Les lignes du tableau jeté (libellés et pourcentages du PDF), alignées sur
   * le modèle `EvalDetail[]` : le jeté de référence en tête, puis les variantes
   * exprimées en pourcentage du jeté réalisé.
   */
  protected readonly exercices: readonly JerkRow[] = [
    {code: 'exercice.jerk.tech.simple',  label: 'evaluations.wizard.jerk.reference', factor: 1.00},
    {code: 'exercice.jerk.tech.simple',  label: 'exercice.jerk.tech.simple',  factor: 1.00},
		{code: 'exercice.jerk.heavy.power',  label: 'exercice.jerk.heavy.power',  factor: 0.92},
    {code: 'exercice.jerk.heavy.no-feet', label: 'exercice.jerk.heavy.no-feet', factor: 0.90},
    {code: 'exercice.jerk.light.muscle', label: 'exercice.jerk.light.muscle', factor: 0.71}
  ];

  /** Modèle du form : une ligne eval_details par question (alignée sur `exercices`). */
  private readonly model = signal<EvalDetail[]>(this.emptyModel());

  /**
   * Signal Form sur le modèle `EvalDetail[]` : pilote `wa-input` (realValue) et
   * `app-eval-rating` (result) via `[formField]`. Le jeté de référence est
   * toujours saisissable ; une variante est verrouillée tant que le jeté réalisé
   * est vide.
   */
  protected readonly jerkForm = form(this.model, (path) => {
    // Désactive la ligne entière (realValue + result) tant que sa base manque.
    // Le contexte d'item porte l'index ; disabled sur l'item se propage aux sous-champs.
    applyEach(path, (rowPath) => {
      disabled(rowPath, {when: (ctx) => this.isRowDisabled(ctx.index())});
    });
  });

  /** Jeté de référence réalisé (base des variantes). */
  private readonly jerkRealised = computed<number | null>(
    () => this.model()[EvalWizardJerkComponent.JERK_INDEX]?.realValue ?? null
  );

  /**
   * Bornes dynamiques par ligne (en kg, arrondies) : `low` = attendu −5%,
   * `expected`, `high` = attendu +5%. `null` pour le jeté de référence (pas de
   * rating) et tant que la base n'est pas saisie. Les libellés sont composés en
   * template.
   */
  protected readonly thresholds = computed<JerkThreshold[]>(() =>
    this.exercices.map((row, i) => {
      if (i === EvalWizardJerkComponent.JERK_INDEX) {
        return {low: null, expected: null, high: null};
      }
      const base = this.jerkRealised();
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

  /** Une variante est verrouillée tant que le jeté de référence n'est pas saisi. */
  private isRowDisabled(index: number): boolean {
    if (index === EvalWizardJerkComponent.JERK_INDEX) {
      return false;
    }
    return this.jerkRealised() == null;
  }

  private emptyModel(): EvalDetail[] {
    return this.exercices.map((row) => ({
      evalCategorie: EvalWizardJerkComponent.CATEGORIE,
      exerciceCode: row.code,
      realValue: null,
      result: null
    }));
  }
}
