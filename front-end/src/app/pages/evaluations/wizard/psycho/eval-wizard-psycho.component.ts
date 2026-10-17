import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, input, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {EvalCategorie, EvalDetail} from '../../../../models/eval-detail.model';
import {EvalWizardStep} from '../eval-wizard-step';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';

/** Clé identifiant l'un des 7 blocs du profil psychologique. */
export type PsychoBlockKey =
  | 'emotional'
  | 'confidence'
  | 'motivation'
  | 'focus'
  | 'competitive'
  | 'failure'
  | 'autonomy';

/**
 * Étape générique du profil psychologique du wizard d'évaluation (catégorie
 * {@link EvalCategorie} `PSYCHO`). Implémente {@link EvalWizardStep}.
 *
 * Chaque bloc psychologique propose 7 affirmations ; l'athlète coche celles qui
 * le concernent. On ne stocke pas de résultat qualitatif (-1/0/1) : le réalisé
 * est un **score binaire** où l'affirmation n°k (1-indexée) pèse 2^(k-1). Le
 * score encode donc exactement la combinaison cochée (0 à 127). Une seule ligne
 * `eval_details` est produite par bloc : `realValue = score`, `result = null`.
 *
 * Le composant **porte la définition des blocs** ({@link BLOCKS}) : le parent se
 * contente d'itérer sur cette liste et de passer la clé du bloc via l'input
 * {@link block}. Le composant en dérive l'`exercice_code`, le libellé du bloc
 * et les 7 clés i18n des affirmations. L'étape est toujours valide (cocher zéro
 * affirmation est autorisé).
 */
@Component({
  selector: 'app-eval-wizard-psycho',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-psycho.component.html',
  providers: [{provide: EvalWizardStep, useExisting: EvalWizardPsychoComponent}]
})
export class EvalWizardPsychoComponent implements EvalWizardStep {

  private static readonly CATEGORIE: EvalCategorie = 'PSYCHO';

  /** Nombre d'affirmations par bloc. */
  private static readonly ITEMS_PER_BLOCK = 7;

  /**
   * Les 7 blocs du profil psychologique, dans l'ordre d'affichage du wizard.
   * Source de vérité portée par le composant lui-même : le parent itère dessus.
   */
  static readonly BLOCKS: readonly PsychoBlockKey[] = [
    'emotional',
    'confidence',
    'motivation',
    'focus',
    'competitive',
    'failure',
    'autonomy'
  ];

  /** Clé i18n du libellé (titre) d'un bloc, dérivée de sa clé. */
  static labelOf(block: PsychoBlockKey): string {
    return `evaluations.wizard.psycho.${block}`;
  }

  /** Clé du bloc à afficher (fournie par le parent via {@link BLOCKS}).
   *
   * Optionnel plutôt que `required` : le parent collecte les `value()` des
   * instances dès leur création (ex. `computed` dans le dialog), avant que
   * l'input ne soit résolu. On évite ainsi `NG0950` en traitant proprement le
   * cas « pas encore de bloc ».
   */
  readonly block = input<PsychoBlockKey | null>(null);

  /** `exercice_code` stocké dans la ligne `eval_details` du bloc (`''` tant que le bloc n'est pas résolu). */
  private readonly code = computed<string>(() => {
    const block = this.block();
    return block ? `eval.psycho.${block}` : '';
  });

  /** Clés i18n des 7 affirmations du bloc : `<prefixe>.1` … `.7` (vide tant que le bloc n'est pas résolu). */
  protected readonly labels = computed<readonly string[]>(() => {
    const block = this.block();
    if (!block) {
      return [];
    }
    const prefix = `evaluations.wizard.psycho.items.${block}`;
    return Array.from({length: EvalWizardPsychoComponent.ITEMS_PER_BLOCK}, (_, i) => `${prefix}.${i + 1}`);
  });

  /** État coché de chaque affirmation (aligné par index sur `labels`). */
  protected readonly checked = signal<boolean[]>([]);

  /**
   * Score binaire du bloc : somme des 2^index pour les affirmations cochées.
   * Un bloc vierge vaut 0, valeur significative (aucune affirmation cochée).
   */
  private readonly score = computed<number>(() =>
    this.checked().reduce((sum, isChecked, index) => isChecked ? sum + (1 << index) : sum, 0)
  );

  /** Contrat {@link EvalWizardStep} : l'étape est toujours valide (0 autorisé). */
  readonly valid = signal(true).asReadonly();

  /** Contrat {@link EvalWizardStep} : une seule ligne eval_details par bloc. */
  readonly value = computed<readonly EvalDetail[]>(() => [{
    evalCategorie: EvalWizardPsychoComponent.CATEGORIE,
    exerciceCode: this.code(),
    realValue: this.score(),
    result: null
  }]);

  /** Contrat {@link EvalWizardStep} : décoche toutes les affirmations. */
  reset(): void {
    this.checked.set(this.labels().map(() => false));
  }

  /**
   * Contrat {@link EvalWizardStep} : pré-remplit le bloc (édition).
   * Reconstitue les cases cochées en décodant le score binaire de la ligne
   * `eval_details` correspondant à ce bloc (`exerciceCode = eval.psycho.<block>`).
   */
  load(details: readonly EvalDetail[]): void {
    const row = details.find((d) => d.exerciceCode === this.code());
    const score = row?.realValue ?? 0;
    const count = this.labels().length;
    this.checked.set(Array.from({length: count}, (_, i) => (score & (1 << i)) !== 0));
  }

  /** Met à jour l'état coché d'une affirmation suite à l'événement du checkbox. */
  protected onToggle(index: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checked.update((state) => {
      // Garantit un tableau de la bonne taille même avant le premier reset().
      const next = state.length === this.labels().length ? [...state] : this.labels().map(() => false);
      next[index] = isChecked;
      return next;
    });
  }
}
