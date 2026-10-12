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
 
