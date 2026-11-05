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
