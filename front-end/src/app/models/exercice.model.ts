/** Valeurs possibles alignées sur les enums backend / contraintes BD. */
export type TypeExercice = 'SQUAT' | 'PULL' | 'SNATCH' | 'CLEAN' | 'JERK';
export type CategorieExercice =
  | 'TECH'
  | 'COMBI'
  | 'SEMI_LEGER'
  | 'SEMI_LOURD'
  | 'RENFO'
  | 'CARDIO'
  | 'PLYO'
  | 'BACK'
  | 'FRONT';

export const TYPE_EXERCICES: readonly TypeExercice[] = ['SQUAT', 'PULL', 'SNATCH', 'CLEAN', 'JERK'];
export const CATEGORIE_EXERCICES: readonly CategorieExercice[] = [
  'TECH',
  'COMBI',
  'SEMI_LEGER',
  'SEMI_LOURD',
  'RENFO',
  'CARDIO',
  'PLYO',
  'BACK',
  'FRONT'
];

/** Exercice de référence (ExerciceResponse). */
export interface Exercice {
  readonly exerciceId: number;
  readonly exerciceRef: number | null;
  readonly typeExercice: TypeExercice;
  readonly categorieExercice: CategorieExercice;
  readonly exerciceCode: string;
  readonly estimateValue: number | null;
}

/** Payload de création / modification (ExerciceRequest). */
export interface ExerciceRequest {
  typeExercice: TypeExercice;
  categorieExercice: CategorieExercice;
  exerciceCode: string;
  exerciceRef: number | null;
  estimateValue: number | null;
}

/** Critères de recherche métier des exercices (hors pagination/tri). */
export interface ExerciceFilter {
  typeExercice: TypeExercice | null;
  categorieExercice: CategorieExercice | null;
}

/**
 * Exercices de référence sélectionnables (liste figée) : identifiant en base et
 * clé i18n du libellé affiché. Utilisé pour le champ « exercice de référence »
 * du formulaire.
 */
export interface ReferenceExercice {
  readonly id: number;
  readonly labelKey: string;
}

export const REFERENCE_EXERCICES: readonly ReferenceExercice[] = [
  {id: 1, labelKey: 'exercice.total'},
  {id: 2, labelKey: 'exercice.snatch.tech.simple'},
  {id: 60, labelKey: 'exercice.clean.tech.simple'},
  {id: 120, labelKey: 'exercice.jerk.tech.simple'}
];
