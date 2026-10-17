import {Archetype, Endurance, StrengthSpeed, Technique} from './archetype.model';
import {PsychoStrength, PsychoWeakness} from './evaluation.model';

/** Profil d'un mouvement (squat / tirage) ou d'un axe force-vitesse. */
export type StrengthSpeedProfile = StrengthSpeed;

/** Objectif d'un protocole squat / tirage dans la synthèse. */
export type ProtocolGoal = 'STRENGTH' | 'MID' | 'SPEED';

/** Valeurs possibles du profil squat / tirage (alignées sur `eval_summaries.squat` / `pull`). */
export const PROTOCOL_GOALS: readonly ProtocolGoal[] = ['STRENGTH', 'MID', 'SPEED'];

/**
 * Drapeaux de musculation (bitmask stocké). Chaque orientation est une
 * puissance de 2 : la synthèse additionne les orientations cochées.
 */
export const MUSCULATION_FLAGS = {
  GENERAL: 1,
  LEGS: 2,
  POSTERIOR_CHAIN: 4,
  UPPER_BODY: 8
} as const;

/** Clés des orientations de musculation (ordre d'affichage et de pondération). */
export type MusculationKey = keyof typeof MUSCULATION_FLAGS;

/**
 * Bilan synthétique d'une évaluation — miroir de la table `eval_summaries`.
 *
 * Alimenté par l'étape Synthèse du wizard à partir des résultats des étapes
 * précédentes (présélection), puis librement ajustable par le coach. Distinct
 * des `EvalDetail` (qui conservent l'historique brut des réponses).
 */
export interface EvalSummary {
  /** Axe force-vitesse global. */
  strengthSpeed: StrengthSpeed | null;
  /** Axe technique global. */
  technique: Technique | null;
  /** Axe endurance / récupération. */
  endurance: Endurance | null;
  /** Archétype dérivé de la combinaison des 3 axes. */
  archetype: Archetype | null;

  /** Profil squat (objectif du protocole squat). */
  squat: ProtocolGoal | null;
  /** Profil tirage (objectif du protocole tirage). */
  pull: ProtocolGoal | null;
  /** Orientations de musculation (bitmask des {@link MUSCULATION_FLAGS}). */
  musculation: number;

  /** Point fort / faible technique par mouvement (exercice_code). */
  snatchStrength: string | null;
  snatchWeakness: string | null;
  cleanStrength: string | null;
  cleanWeakness: string | null;
  jerkStrength: string | null;
  jerkWeakness: string | null;

  /** Profil psychologique dominant / déficient. */
  psychoStrength: PsychoStrength | null;
  psychoWeakness: PsychoWeakness | null;
}
