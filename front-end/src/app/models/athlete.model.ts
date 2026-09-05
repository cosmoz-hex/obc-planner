/** Valeurs possibles alignées sur les enums backend / contraintes BD. */
export type Sexe = 'M' | 'F';
export type AgeCategorie = 'U15' | 'U17' | 'U20' | 'SEN' | 'MASTER';
export type CompLevel = 'DEB' | 'DPT' | 'REG' | 'IRG' | 'HON' | 'NAT' | 'EUR' | 'MON';

/** Catégories de poids valides par sexe (999 = catégorie « supérieur »). */
export const WEIGHT_CATEGORIES: Readonly<Record<Sexe, readonly number[]>> = {
  M: [51, 55, 60, 65, 70, 75, 85, 95, 110, 999],
  F: [41, 45, 49, 53, 57, 61, 69, 77, 86, 999]
} as const;

export const AGE_CATEGORIES: readonly AgeCategorie[] = ['U15', 'U17', 'U20', 'SEN', 'MASTER'];
export const COMP_LEVELS: readonly CompLevel[] = ['DEB', 'DPT', 'REG', 'IRG', 'HON', 'NAT', 'EUR', 'MON'];
export const SEXES: readonly Sexe[] = ['M', 'F'];

/** Athlète tel que renvoyé par l'API (AthleteResponse). */
export interface Athlete {
  readonly athleteId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly sexe: Sexe;
  readonly ageCategorie: AgeCategorie | null;
  readonly weightCategorie: number | null;
  readonly compLevel: CompLevel | null;
  /** Date de dernière évaluation (ISO) ou null. */
  readonly lastEvaluationDate: string | null;
}

/** Payload de création / modification (AthleteRequest). */
export interface AthleteRequest {
  firstName: string;
  lastName: string;
  sexe: Sexe;
  ageCategorie: AgeCategorie;
  weightCategorie: number;
  compLevel: CompLevel;
}

/** Critères de recherche métier des athlètes (hors pagination/tri). */
export interface AthleteFilter {
  sexe: Sexe | null;
  ageCategorie: AgeCategorie | null;
}
