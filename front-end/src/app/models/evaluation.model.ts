import {Archetype, Endurance, StrengthSpeed, Technique} from './archetype.model';

/** Point fort psychologique, aligné sur l'enum backend PsychoStrength. */
export type PsychoStrength =
  | 'CALM'
  | 'CONFIDENT'
  | 'MOTIVATED'
  | 'FOCUSED'
  | 'COMPETITIVE'
  | 'CHALLENGER'
  | 'INDEPENDANT';

/** Point faible psychologique, aligné sur l'enum backend PsychoWeakness. */
export type PsychoWeakness =
  | 'EMOTIONAL'
  | 'ANXIOUS'
  | 'INDIFFERENT'
  | 'DISTRACTED'
  | 'HEDONISTIC'
  | 'PRAGMATIC'
  | 'RULE';

/** Évaluation telle que renvoyée par l'API (EvaluationResponse), une par ligne. */
export interface Evaluation {
  readonly evaluationId: number;
  readonly athleteId: number;
  readonly firstName: string;
  readonly lastName: string;
  /** Date d'évaluation (ISO) ou null. */
  readonly evaluationDate: string | null;
  readonly archetype: Archetype | null;
  readonly strengthSpeed: StrengthSpeed | null;
  readonly technique: Technique | null;
  readonly endurance: Endurance | null;
  readonly psychoStrength: PsychoStrength | null;
  readonly psychoWeakness: PsychoWeakness | null;
}
