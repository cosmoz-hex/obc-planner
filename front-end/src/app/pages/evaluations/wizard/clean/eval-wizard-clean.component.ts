import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {FormField, applyEach, disabled, form} from '@angular/forms/signals';
import {EvalCategorie, EvalDetail} from '../../../../models/eval-detail.model';
import {EvalWizardStep, mergeDetails, TechniqueEvalStep, TechniqueGap} from '../eval-wizard-step';
import {EvalRatingComponent} from '../rating/eval-rating.component';
import {WaNumberInputControlDirective} from '../../../../directives/wa-forms/wa-number-input-control.directive';
import {SanitizeHtmlPipe} from '../../../../pipes/sanitize-html.pipe';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/input/input.js';

/** Marge appliquée autour de l'attendu pour borner Faible / Moyen / Fort. */
const MARGIN = 0.05;

/**
 * Définition statique d'une ligne du tableau épaulé.
 *
 * `factor` est un pourcentage appliqué à l'épaulé de référence réalisé pour
 * obtenir la valeur attendue de la variante.
 */
interface CleanRow {
  /** `exercice_code` stocké dans `eval_details`. */
  code: string;
  /** Clé i18n du libellé. */
  label: string;
  /** Multiplicateur appliqué à l'épaulé de référence réalisé. */
  factor: number;
}

/** Bornes dynamiques d'une ligne (en kg), `null` tant que la base manque. */
interface CleanThreshold {
  low: number | null;
  expected: number | null;
  high: number | null;
}

/**
 * Étape 4 du wizard d'évaluation : Technique sur l'épaulé (catégorie
 * {@link EvalCategorie} `TECH`). Implémente {@link EvalWizardStep}.
 *
 * Comme les étapes Vitesse / Force / Arraché, le modèle du Signal Form est
 * directement un `EvalDetail[]` (ce qui sera inséré en base) : une ligne par
 * mesure, alignée sur {@link exercices} par index. La première ligne est
 * l'**épaulé de référence** (sans rating) : c'est la base de calcul des
 * variantes.
 *
 * Les **libellés** des seuils Faible / Moyen / Fort sont **dynamiques** : chaque
 * variante attend un pourcentage de l'épaulé de référence réalisé ; on applique
 * une marge de ±5% autour de l'attendu (arrondi à l'entier) pour afficher
 * `< low` / `attendu` / `> high` sur le contrôle {@link EvalRatingComponent}. Le
 * résultat (-1/0/1) reste choisi par le coach.
 *
 * Désactivation en cascade : les variantes sont saisissables une fois l'épaulé
 * de référence renseigné.
 */
@Component({
  selector: 'app-eval-wizard-clean',
  standalone: true,
  imports: [TranslatePipe, DecimalPipe, SanitizeHtmlPipe, FormField, WaNumberInputControlDirective, EvalRatingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-clean.component.html',
  providers: [
    {provide: EvalWizardStep, useExisting: EvalWizardCleanComponent},
    {provide: TechniqueEvalStep, useExisting: EvalWizardCleanComponent}
  ]
})
export class EvalWizardCleanComponent implements TechniqueEvalStep {

  private static readonly CATEGORIE: EvalCategorie = 'TECH';

  /** Index de la ligne épaulé de référence (base des variantes). */
  private static readonly CLEAN_INDEX = 0;

  /**
   * Les lignes du tableau épaulé (libellés et pourcentages du PDF), alignées sur
   * le modèle `EvalDetail[]` : l'épaulé de référence en tête, puis les variantes
   * exprimées en pourcentage de l'épaulé réalisé.
   */
  protected readonly exercices: readonly CleanRow[] = [
    {code: 'exercice.clean.tech.simple',   label: 'evaluations.wizard.clean.reference', factor: 1.00},
    {code: 'exercice.clean.heavy.squat',   label: 'exercice.clean.heavy.squat',   factor: 1.00},
    {code: 'exercice.clean.heavy.power',   label: 'exercice.clean.heavy.power',   factor: 0.84},
    {code: 'exercice.clean.heavy.block',   label: 'exercice.clean.heavy.block',   factor: 0.95},
    {code: 'exercice.clean.heavy.hang',    label: 'exercice.clean.heavy.hang',    factor: 0.95},
    {code: 'exercice.clean.heavy.no-feet', label: 'exercice.clean.heavy.no-feet', factor: 0.92},
    {code: 'exercice.clean.light.muscle',  label: 'exercice.clean.light.muscle',  factor: 0.63},
    {code: 'exercice.clean.light.tall',    label: 'exercice.clean.light.tall',    factor: 0.62},
    {code: 'exercice.clean.pull.simple',   label: 'exercice.clean.pull.simple',   factor: 1.30},
    {code: 'exercice.clean.pull.double',   label: 'exercice.clean.pull.double',   factor: 1.24},
    {code: 'exercice.clean.pull.triple',   label: 'exercice.clean.pull.triple',   factor: 1.17}
  ];

  /** Modèle du form : une ligne eval_details par question (alignée sur `exercices`). */
  private readonly model = signal<EvalDetail[]>(this.emptyModel());

  /**
   * Signal Form sur le modèle `EvalDetail[]` : pilote `wa-input` (realValue) et
   * `app-eval-rating` (result) via `[formField]`. L'épaulé de référence est
   * toujours saisissable ; une variante est verrouillée tant que l'épaulé
   * réalisé est vide.
   */
  protected readonly cleanForm = form(this.model, (path) => {
    // Désactive la ligne entière (realValue + result) tant que sa base manque.
    // Le contexte d'item porte l'index ; disabled sur l'item se propage aux sous-champs.
    applyEach(path, (rowPath) => {
      disabled(rowPath, {when: (ctx) => this.isRowDisabled(ctx.index())});
    });
  });

  /** Épaulé de référence réalisé (base des variantes). */
  private readonly cleanRealised = computed<number | null>(
    () => this.model()[EvalWizardCleanComponent.CLEAN_INDEX]?.realValue ?? null
  );

  /**
   * Bornes dynamiques par ligne (en kg, arrondies) : `low` = attendu −5%,
   * `expected`, `high` = attendu +5%. `null` pour l'épaulé de référence (pas de
   * rating) et tant que la base n'est pas saisie. Les libellés sont composés en
   * template.
   */
  protected readonly thresholds = computed<CleanThreshold[]>(() =>
    this.exercices.map((row, i) => {
      if (i === EvalWizardCleanComponent.CLEAN_INDEX) {
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

  /**
   * Contrat {@link TechniqueEvalStep} : écart réalisé / attendu par variante
   * mesurée. L'attendu provient de {@link thresholds} (référence × facteur) ;
   * on exclut la ligne de référence et les mouvements de tirage.
   */
  readonly techniqueGaps = computed<readonly TechniqueGap[]>(() => {
    const rows = this.model();
    const thresholds = this.thresholds();
    return this.exercices
      .map((row, i) => ({row, realValue: rows[i]?.realValue ?? null, expected: thresholds[i]?.expected ?? null}))
      .filter((_, i) => i !== EvalWizardCleanComponent.CLEAN_INDEX)
      .filter(({row}) => !row.code.includes('.pull.'))
      .map(({row, realValue, expected}) => ({
        code: row.code,
        gap: realValue != null && expected != null && expected !== 0
          ? (realValue - expected) / expected
          : null
      }));
  });

  /** Contrat {@link EvalWizardStep} : réinitialise le formulaire. */
  reset(): void {
    this.model.set(this.emptyModel());
  }

  /** Contrat {@link EvalWizardStep} : pré-remplit les mesures (édition). */
  load(details: readonly EvalDetail[]): void {
    this.model.set(mergeDetails(this.model(), details));
  }

  /** Une variante est verrouillée tant que l'épaulé de référence n'est pas saisi. */
  private isRowDisabled(index: number): boolean {
    if (index === EvalWizardCleanComponent.CLEAN_INDEX) {
      return false;
    }
    return this.cleanRealised() == null;
  }

  private emptyModel(): EvalDetail[] {
    return this.exercices.map((row) => ({
      evalCategorie: EvalWizardCleanComponent.CATEGORIE,
      exerciceCode: row.code,
      realValue: null,
      result: null
    }));
  }
}
