import {Archetype, Endurance, StrengthSpeed, Technique} from './archetype.model';
import {ProtocolGoal} from './eval-summary.model';

/** Nombre de séances par semaine (aligné sur l'enum / contrainte BD). */
export type Frequency = 3 | 4 | 5;
/** Durée d'un programme en nombre de semaines. */
export type Weeks = 8 | 12 | 16;
/** Durée d'une séance en minutes. */
export type Duration = 90 | 120 | 150;
/** Type de semaine d'un programme : F, T, S, A, D, PC. */
export type ProgrammeWeekType = 'F' | 'T' | 'S' | 'A' | 'D' | 'PC';

/** Options sélectionnables pour la durée du programme (nombre de semaines). */
export const WEEKS_OPTIONS: readonly Weeks[] = [8, 12, 16];
/** Options sélectionnables pour la fréquence hebdomadaire. */
export const FREQUENCY_OPTIONS: readonly Frequency[] = [3, 4, 5];
/** Options sélectionnables pour la durée d'une séance (minutes). */
export const DURATION_OPTIONS: readonly Duration[] = [90, 120, 150];

/** Ligne de la liste des programmes telle que renvoyée par l'API (ProgrammeResponse). */
export interface ProgrammeRow {
  readonly programmeId: number;
  readonly athleteFirstName: string;
  readonly athleteLastName: string;
  readonly startDate: string;
  readonly weeks: number;
  readonly frequency: number;
  readonly snatchGoal: number;
  readonly cjGoal: number;
}

/** Série d'un exercice planifié (ProgrammeSeriesResponse). */
export interface ProgrammeSeries {
  readonly programmeSeriesId: number;
  readonly setNumber: number | null;
  readonly repNumber: string | null;
  readonly minWeight: number | null;
  readonly maxWeight: number | null;
}

/** Exercice planifié d'une séance avec ses séries (ProgrammeExerciceResponse). */
export interface ProgrammeExercice {
  readonly programmeExerciceId: number;
  readonly exerciceOrder: number;
  readonly exerciceName: string;
  readonly series: ProgrammeSeries[];
}

/** Séance planifiée d'une semaine avec ses exercices (ProgrammeTrainingResponse). */
export interface ProgrammeTraining {
  readonly programmeTrainingId: number;
  readonly trainingNumber: number;
  readonly exercices: ProgrammeExercice[];
}

/** Semaine d'un programme avec ses séances (ProgrammeWeekResponse). */
export interface ProgrammeWeek {
  readonly weekNumber: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly weekType: ProgrammeWeekType;
  readonly basePercent: number;
  readonly snatchGoal: number;
  readonly cjGoal: number;
  readonly backSquatGoal: number;
  readonly frontSquatGoal: number;
  readonly snatchPullGoal: number;
  readonly cjPullGoal: number;
  readonly trainings: ProgrammeTraining[];
}

/** Détail complet d'un programme (ProgrammeDetailResponse). */
export interface ProgrammeDetail {
  readonly programmeId: number;
  readonly evaluationId: number;
  readonly athleteFirstName: string;
  readonly athleteLastName: string;
  readonly weeks: number;
  readonly frequency: number;
  readonly duration: number | null;
  readonly startDate: string;
  readonly endDate: string;
  readonly snatchGoal: number;
  readonly cjGoal: number;
  readonly frontSquatGoal: number;
  readonly backSquatGoal: number;
  readonly snatchPullGoal: number;
  readonly cjPullGoal: number;
  readonly programmeWeeks: ProgrammeWeek[];
}

/** Synthèse saisie ou pré-remplie à la génération (ProgrammeProfileRequest). Sans psychologie. */
export interface ProgrammeProfile {
  archetype: Archetype;
  strengthSpeed: StrengthSpeed;
  technique: Technique;
  endurance: Endurance;
  squat: ProtocolGoal;
  pull: ProtocolGoal;
  /** Bitmask des orientations de musculation (0..15). */
  musculation: number;
  /** Points faibles techniques (EXT / CATCH / PATH) ou null. */
  snatch: string | null;
  clean: string | null;
  jerk: string | null;
}

/** Payload de création d'un programme (ProgrammeCreateRequest). */
export interface ProgrammeCreateRequest {
  athleteId: number;
  /** Évaluation de départ (optionnelle) ; null = synthèse saisie à la volée. */
  evaluationId: number | null;
  profile: ProgrammeProfile;
  weeks: number;
  frequency: number;
  duration: number | null;
  startDate: string;
  snatchGoal: number;
  cjGoal: number;
  frontSquatGoal: number;
  backSquatGoal: number;
  snatchPullGoal: number;
  cjPullGoal: number;
}

/** Série éditée d'un exercice d'une cellule (CellSeriesRequest). */
export interface CellSeries {
  programmeSeriesId: number | null;
  setNumber: number | null;
  repNumber: string | null;
  minWeight: number | null;
  maxWeight: number | null;
}

/** Exercice édité d'une cellule, avec ses séries (CellExerciceRequest). */
export interface CellExercice {
  programmeExerciceId: number | null;
  exerciceName: string;
  series: CellSeries[];
}

/** Payload de mise à jour d'une cellule (séance) d'un programme (ProgrammeCellUpdateRequest). */
export interface ProgrammeCellUpdateRequest {
  weekNumber: number;
  trainingNumber: number;
  exerciceOrder: number;
  exercices: CellExercice[];
}

/** Critères de recherche métier des programmes (hors pagination/tri). */
export interface ProgrammeFilter {
  athleteId: number | null;
}
