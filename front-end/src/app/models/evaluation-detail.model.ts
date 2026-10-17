import {Archetype, Endurance, StrengthSpeed, Technique} from './archetype.model';
import {PsychoStrength, PsychoWeakness} from './evaluation.model';
import {ProtocolGoal} from './eval-summary.model';
import {EvalDetail} from './eval-detail.model';

/**
 * Relecture complète d'une évaluation (miroir d'EvaluationDetailResponse
 * backend) : le bilan synthétique, l'athlète, la date et le détail des mesures.
 * Sert à pré-remplir le wizard en mode édition.
 */
export interface EvaluationDetail {
  evaluationId: number;
  athleteId: number;
  /** Date d'évaluation au format ISO (yyyy-MM-dd). */
  evaluationDate: string;
  archetype: Archetype | null;
  strengthSpeed: StrengthSpeed | null;
  technique: Technique | null;
  endurance: Endurance | null;
  squat: ProtocolGoal | null;
  pull: ProtocolGoal | null;
  musculation: number;
  snatchStrength: string | null;
  snatchWeakness: string | null;
  cleanStrength: string | null;
  cleanWeakness: string | null;
  jerkStrength: string | null;
  jerkWeakness: string | null;
  psychoStrength: PsychoStrength | null;
  psychoWeakness: PsychoWeakness | null;
  details: EvalDetail[];
}
