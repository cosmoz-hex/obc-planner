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

/** Exercice planifié d'une séance (ProgrammeTrainingResponse). */
export interface ProgrammeTraining {
  readonly programmeTrainingId: number;
  readonly trainingNumber: number;
  readonly exerciceOrder: number;
  readonly exerciceName: string;
  readonly setNumber: number | null;
  readonly repNumber: string | null;
  readonly repLabel: string | null;
  readonly minWeight: number | null;
  readonly maxWeight: number | null;
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
  readonly programmeWeeks: ProgrammeWeek[];
}

/** Payload de création d'un programme (ProgrammeCreateRequest). */
export interface ProgrammeCreateRequest {
  evaluationId: number;
  weeks: number;
  frequency: number;
  duration: number | null;
  startDate: string;
  snatchGoal: number;
  cjGoal: number;
}

/** Ligne d'exercice d'une cellule modifiée (CellLineRequest). */
export interface CellLine {
  programmeTrainingId: number | null;
  exerciceName: string;
  setNumber: number | null;
  repNumber: string | null;
  repLabel: string | null;
  minWeight: number | null;
  maxWeight: number | null;
}

/** Payload de mise à jour d'une cellule (séance) d'un programme (ProgrammeCellUpdateRequest). */
export interface ProgrammeCellUpdateRequest {
  weekNumber: number;
  trainingNumber: number;
  exerciceOrder: number;
  lines: CellLine[];
}

/** Critères de recherche métier des programmes (hors pagination/tri). */
export interface ProgrammeFilter {
  athleteId: number | null;
}
