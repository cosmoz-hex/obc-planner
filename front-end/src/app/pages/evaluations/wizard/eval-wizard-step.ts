import {Signal} from '@angular/core';
import {EvalDetail} from '../../../models/eval-detail.model';

/**
 * Fusionne des lignes `eval_details` existantes dans le modèle d'une étape.
 *
 * Pour chaque ligne du modèle courant, si une ligne chargée partage le même
 * `exerciceCode`, on recopie `realValue` et `result` ; sinon la ligne est
 * laissée telle quelle. Préserve l'ordre et la structure de l'étape (seuils,
 * libellés) : seules les valeurs saisies sont réinjectées.
 */
export function mergeDetails(
  current: readonly EvalDetail[],
  loaded: readonly EvalDetail[]
): EvalDetail[] {
  const byCode = new Map(loaded.map((d) => [d.exerciceCode, d]));
  return current.map((row) => {
    const match = byCode.get(row.exerciceCode);
    return match ? {...row, realValue: match.realValue, result: match.result} : row;
  });
}

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

  /**
   * Pré-remplit l'étape à partir de lignes `eval_details` existantes (édition).
   * Les valeurs sont réinjectées par correspondance de `exerciceCode` ; les
   * lignes non concernées de l'étape restent inchangées.
   */
  abstract load(details: readonly EvalDetail[]): void;
}

/**
 * Contrat spécifique aux étapes techniques (Arraché, Épaulé, Jeté).
 *
 * Distingue les étapes techniques des autres étapes du wizard pour permettre au
 * dialog de les cibler sélectivement via la DI (`{provide: TechniqueEvalStep,
 * useExisting: MonEtapeComponent}`).
 */
export abstract class TechniqueEvalStep extends EvalWizardStep {
  /**
   * Valeur attendue (`expected = base × factor`, arrondie) par exercice, indexée
   * sur `exerciceCode`, hors ligne de référence (index 0).
   *
   * Donnée **purement transitoire côté front** : calculée une seule fois dans
   * l'étape (source des facteurs) et exposée à la synthèse pour le calcul des
   * ratios. Vaut `null` pour un exercice tant que la base de référence du
   * mouvement n'est pas saisie. N'est **jamais** persistée (hors contrat
   * `eval_details`).
   */
  abstract readonly expectedByCode: Signal<ReadonlyMap<string, number | null>>;
}
 
