import {Signal} from '@angular/core';
import {EvalDetail} from '../../../models/eval-detail.model';

/**
 * Contrat commun des étapes métier du wizard d'évaluation.
 *
 * Chaque étape le fournit via `providers: [{provide: EvalWizardStep,
 * useExisting: MonEtapeComponent}]`, ce qui permet au dialog de récupérer
 * toutes les étapes avec `viewChildren(EvalWizardStep)` (notamment pour les
 * réinitialiser à la fermeture) sans les connaître individuellement.
 */
export abstract class EvalWizardStep {
  /** Validité de l'étape (pilote les boutons Suivant / Valider du wizard). */
  abstract readonly valid: Signal<boolean>;

  /** Lignes `eval_details` saisies dans l'étape. */
  abstract readonly value: Signal<readonly EvalDetail[]>;

  /** Réinitialise le formulaire de l'étape à son état vide. */
  abstract reset(): void;
}

/**
 * Écart relatif d'une variante technique à sa valeur attendue.
 *
 * Le ratio compare la charge **réalisée** à la charge **attendue** de la même
 * variante (attendu = référence réalisée × facteur propre à la variante), et
 * non à la référence du mouvement. Il sert à présélectionner force / faiblesse
 * dans l'étape de synthèse.
 */
export interface TechniqueGap {
  /** `exercice_code` de la variante. */
  code: string;
  /**
   * Écart relatif à l'attendu : `(réalisé − attendu) / attendu`.
   * `null` si non calculable (variante non mesurée ou base manquante).
   */
  gap: number | null;
}

/**
 * Contrat spécifique aux étapes techniques (Arraché, Épaulé, Jeté).
 *
 * En plus du contrat {@link EvalWizardStep}, ces étapes savent calculer l'écart
 * réalisé / attendu de chacune de leurs variantes : l'attendu dépend du facteur
 * propre à la variante, connu uniquement de l'étape. La synthèse consomme ces
 * écarts tels quels plutôt que de redéfinir les facteurs.
 */
export abstract class TechniqueEvalStep extends EvalWizardStep {
  /**
   * Écarts réalisé / attendu des variantes mesurées (hors ligne de référence
   * et hors mouvements de tirage).
   */
  abstract readonly techniqueGaps: Signal<readonly TechniqueGap[]>;
}
 
