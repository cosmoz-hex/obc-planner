/** Catégories d'exercice alignées sur l'enum backend / contrainte BD (chk_ref_plannings_4). */
export type ExerciceType = 'SN' | 'CJ' | 'SQ' | 'PL' | 'RF' | 'MS' | 'PC';

export const EXERCICE_TYPES: readonly ExerciceType[] = ['SN', 'CJ', 'SQ', 'PL', 'RF', 'MS', 'PC'];

/** Formats hebdomadaires autorisés (nombre de séances par semaine). */
export const WEEKS_NUMBERS: readonly number[] = [3, 4, 5];

/** Numéros de séance autorisés dans une semaine. */
export const TRAINING_ORDERS: readonly number[] = [1, 2, 3, 4, 5];

/** Ordres d'exercice autorisés dans une séance. */
export const EXERCICE_ORDERS: readonly number[] = [1, 2, 3, 4, 5, 6];

/** Ligne de planning de référence telle que renvoyée par l'API (RefPlanningResponse). */
export interface RefPlanning {
  readonly refPlanningId: number;
  readonly weeksNumbers: number;
  readonly trainingOrder: number;
  readonly exerciceOrder: number;
  readonly exerciceType: ExerciceType;
}

/** Payload de création / modification (RefPlanningRequest). */
export interface RefPlanningRequest {
  weeksNumbers: number;
  trainingOrder: number;
  exerciceOrder: number;
  exerciceType: ExerciceType;
}

/** Critères de recherche métier du planning (hors pagination/tri). */
export interface PlanningFilter {
  weeksNumbers: number | null;
  trainingOrder: number | null;
}

/** Valeur possible d'une cellule de la grille pivot (type d'exercice ou « vide »). */
export type ExerciceTypeOrEmpty = ExerciceType | '';

/** Une cellule de la grille pivot (intersection n° exercice × séance). */
export interface PlanningCell {
  readonly exerciceOrder: number; // 1..6 (ligne)
  readonly trainingOrder: number; // 1..F (colonne = n° séance)
  readonly refPlanningId: number | null; // id de la ligne ref_plannings si elle existe, sinon null
  readonly exerciceType: ExerciceTypeOrEmpty; // type courant ('' = cellule vide)
}

/** Une ligne de la grille pivot (un n° d'exercice, toutes séances confondues). */
export interface PlanningRow {
  readonly exerciceOrder: number; // 1..6
  readonly cells: readonly PlanningCell[]; // longueur = F (une cellule par séance)
}

/** Grille pivot complète pour un format hebdomadaire donné. */
export interface PlanningGrid {
  readonly weeksNumbers: number; // format courant F
  readonly trainingOrders: readonly number[]; // [1..F] (colonnes)
  readonly rows: readonly PlanningRow[]; // 6 lignes (exerciceOrder 1..6)
}
