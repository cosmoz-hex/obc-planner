/**
 * Modèle du détail d'une évaluation — reflète la table `eval_details`.
 *
 * Chaque « question » du wizard produit une ligne : le code de l'exercice/mesure,
 * la valeur réalisée saisie, et le résultat qualitatif (-1/0/1) choisi via les
 * trois radios. Les étapes psycho produisent aussi des lignes (une par case
 * cochée) avec `result = 1` et `realValue = null`.
 */

/** Catégorie de la mesure (colonne `eval_categorie`). */
export type EvalCategorie = 'STRENGTH' | 'TECH' | 'CARDIO' | 'PSYCHO';

/** Résultat qualitatif calculé : LOW (-1), MID (0), HIGH (1). */
export type EvalResult = -1 | 0 | 1;

/** Une ligne de `eval_details`. */
export interface EvalDetail {
  evaluationDetailId?: number;
  evaluationId?: number;
  evalCategorie: EvalCategorie;
  /** Code de la mesure (clé i18n) ; réutilise un code d'exercice existant ou un code `eval.*` dédié. */
  exerciceCode: string;
  /** Valeur mesurée (kg, m/s, %, reps, temps…). `null` tant que non saisie. */
  realValue: number | null;
  /** Résultat -1/0/1 ; `null` tant que non renseigné. */
  result: EvalResult | null;
}

/**
 * Configuration d'une question mesurée dans une étape du wizard :
 * un libellé (clé i18n) et les repères affichés sur chacun des trois radios
 * (Faible / Moyen / Fort), typiquement les seuils ou la valeur attendue.
 */
export interface EvalMeasureRow {
  /** `exercice_code` stocké dans `eval_details`. */
  code: string;
  /** Clé i18n du libellé de la question. */
  label: string;
  /** Repère affiché sur le radio Faible (-1). */
  low: string;
  /** Repère affiché sur le radio Moyen (0). */
  mid: string;
  /** Repère affiché sur le radio Fort (1). */
  high: string;
}
