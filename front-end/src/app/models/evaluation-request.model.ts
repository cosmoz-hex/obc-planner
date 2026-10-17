import {Archetype, Endurance, StrengthSpeed, Technique} from './archetype.model';
import {PsychoStrength, PsychoWeakness} from './evaluation.model';
import {EvalCategorie, EvalResult} from './eval-detail.model';
import {ProtocolGoal} from './eval-summary.model';

/** Ligne de détail envoyée au backend (miroir d'EvalDetailRequest). */
export interface EvalDetailRequest {
  evalCategorie: EvalCategorie;
  exerciceCode: string | null;
  realValue: number | null;
  result: EvalResult | null;
}

/**
 * Payload de création d'une évaluation (miroir d'EvaluationRequest backend) :
 * le bilan synthétique, l'athlète évalué, la date et le détail des mesures.
 */
export interface EvaluationRequest {
  athleteId: number;
  /** Date d'évaluation au format ISO (yyyy-MM-dd). */
  evaluationDate: string;
  archetype: Archetype | null;
  strengthSpeed: StrengthSpeed | null;
  technique: Technique | null;
  endurance: Endurance | null;
  squat: ProtocolGoal | null;
  pull: ProtocolGoal | null;
  /** Bitmask des orientations de musculation. */
  musculation: number;
  snatchStrength: string | null;
  snatchWeakness: string | null;
  cleanStrength: string | null;
  cleanWeakness: string | null;
  jerkStrength: string | null;
  jerkWeakness: string | null;
  psychoStrength: PsychoStrength | null;
  psychoWeakness: PsychoWeakness | null;
  details: EvalDetailRequest[];
}
