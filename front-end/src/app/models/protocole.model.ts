import {Archetype, ARCHETYPES} from './archetype.model';

/**
 * Mouvement saisissable à l'écran (sous-ensemble d'`exercice_type` exposé à l'UI).
 * `CJ` (Clean & Jerk), `RF` (Renfo spécifique) et `PC` ne sont pas des mouvements
 * saisissables : ils restent dans l'enum backend mais ne sont pas proposés ici.
 */
export type Movement = 'SN' | 'CL' | 'JK' | 'SQ' | 'PL' | 'MS';

/** Type de semaine de référence : Foncier, Technique, Surcharge, Affûtage, Deload. */
export type WeekTypeRef = 'F' | 'T' | 'S' | 'A' | 'D';

/**
 * Objectif d'un exercice de référence. Domaine dépendant du mouvement (RG12) :
 * technique (EXT/CATCH/PATH), squat-tirage (KEEP/STR/SPD), musculation (GEN/LEGS/POST/UPPER).
 */
export type ProtocoleGoal =
  | 'EXT' | 'CATCH' | 'PATH'
  | 'KEEP' | 'STR' | 'SPD'
  | 'GEN' | 'LEGS' | 'POST' | 'UPPER';

/**
 * Exercice de référence pour le calcul de charge (domaine distinct d'`exercice_type`).
 * `null` pour la musculation (pas de référence de charge).
 */
export type Reference = 'SN' | 'CJ' | 'FS' | 'BS' | 'SP' | 'CP' | null;

// Réexport pour que les consommateurs des protocoles disposent du type Archétype.
export type {Archetype} from './archetype.model';

/** Jeu de séries de référence d'un exercice, rattaché à un archétype (RefExerciceSetResponse). */
export interface RefExerciceSet {
  readonly refExerciceSetId: number;
  readonly archetype: Archetype;
  readonly setNumber: number;
  readonly repNumber: string | null;
  readonly weight: number | null;
}

/** Exercice de référence et ses séries, tous archétypes confondus (RefExerciceResponse). */
export interface RefExercice {
  readonly refExerciceId: number;
  readonly exerciceType: Movement;
  readonly weekType: WeekTypeRef;
  readonly goal: ProtocoleGoal;
  readonly trainingOrder: number;
  readonly exerciceName: string;
  readonly reference: Reference;
  readonly sets: RefExerciceSet[];
}

/** Jeu de séries d'un payload de création / modification (RefExerciceSetRequest). */
export interface RefExerciceSetRequest {
  archetype: Archetype;
  setNumber: number;
  repNumber: string | null;
  weight: number | null;
}

/** Payload de création / modification d'un exercice de référence (RefExerciceRequest). */
export interface RefExerciceRequest {
  exerciceType: Movement;
  weekType: WeekTypeRef;
  goal: ProtocoleGoal;
  trainingOrder: number;
  exerciceName: string;
  reference: Reference;
  sets: RefExerciceSetRequest[];
}

/** Critères de recherche métier des protocoles (hors pagination/tri). */
export interface ProtocoleFilter {
  exerciceType: Movement | null;
  weekType: WeekTypeRef | null;
  goal: ProtocoleGoal | null;
  archetype: Archetype | null;
}

/**
 * Ligne du tableau après éclatement par archétype : un exercice de référence
 * produit autant de lignes que d'archétypes distincts présents dans ses séries.
 */
export interface ProtocoleRow {
  readonly exercice: RefExercice;
  readonly archetype: Archetype;
  readonly sets: RefExerciceSet[];
}

/** Mouvements proposés dans les listes déroulantes (ordre d'affichage). */
export const MOVEMENTS: readonly Movement[] = ['SN', 'CL', 'JK', 'SQ', 'PL', 'MS'];

/** Types de semaine proposés dans les listes déroulantes (ordre d'affichage). */
export const WEEK_TYPES: readonly WeekTypeRef[] = ['F', 'T', 'S', 'A', 'D'];

/** Archétypes proposés dans les listes déroulantes (réutilise le domaine du model archétype). */
export const PROTOCOLE_ARCHETYPES: readonly Archetype[] = ARCHETYPES;

/** Objectifs techniques (Arraché / Épaulé / Jeté). */
const TECHNIQUE_GOALS: readonly ProtocoleGoal[] = ['EXT', 'CATCH', 'PATH'];
/** Objectifs squat / tirage. */
const STRENGTH_GOALS: readonly ProtocoleGoal[] = ['KEEP', 'STR', 'SPD'];
/** Objectifs musculation. */
const MUSCULATION_GOALS: readonly ProtocoleGoal[] = ['GEN', 'LEGS', 'POST', 'UPPER'];

/**
 * Objectifs applicables par mouvement (RG12) : la liste Objectif (filtre et modale)
 * se recalcule selon le mouvement courant.
 */
export const GOALS_BY_MOVEMENT: Readonly<Record<Movement, readonly ProtocoleGoal[]>> = {
  SN: TECHNIQUE_GOALS,
  CL: TECHNIQUE_GOALS,
  JK: TECHNIQUE_GOALS,
  SQ: STRENGTH_GOALS,
  PL: STRENGTH_GOALS,
  MS: MUSCULATION_GOALS
};

/**
 * Référence de charge déduite par défaut du mouvement (RG4), présentée en lecture seule
 * dans la modale.
 *
 * Arraché (`SN`) → `SN` ; Épaulé (`CL`) → `CJ` ; Jeté (`JK`) → `CJ` ;
 * Squat (`SQ`) → `BS` (Flexion Nuque par défaut ; `FS` pour Flexion Clavicule) ;
 * Tirage (`PL`) → `SN` (Tirage Arraché par défaut ; `CJ` pour Tirage Épaulé) ;
 * Musculation (`MS`) → `null` (aucune référence de charge).
 */
export const REFERENCE_BY_MOVEMENT: Readonly<Record<Movement, Reference>> = {
  SN: 'SN',
  CL: 'CJ',
  JK: 'CJ',
  SQ: 'BS',
  PL: 'SN',
  MS: null
};

/** Déduit la référence de charge par défaut à partir du mouvement (RG4). */
export function referenceForMovement(movement: Movement): Reference {
  return REFERENCE_BY_MOVEMENT[movement];
}

/**
 * Exercices de référence de charge sélectionnables dans la modale (ordre d'affichage).
 *
 * Le domaine stocké est `{SN, CJ, FS, BS, SP, CP}` (colonne `ref_exercices.reference`,
 * inchangé). Chaque option = une valeur stockée unique : `CJ` (épaulé-jeté de
 * référence) couvre à la fois l'Épaulé et le Jeté, qui se chargent tous deux sur
 * l'épaulé-jeté (RG4). On expose donc UNE entrée « Épaulé-Jeté » (et non deux
 * entrées distinctes Épaulé/Jeté qui partageraient la même valeur `CJ` — ce qui
 * provoquerait une collision d'unicité dans un `<wa-select>`). `SP`/`CP` ne sont
 * pas proposés (non demandés et non utilisés par la déduction actuelle).
 */
export const REFERENCE_OPTIONS: readonly Exclude<Reference, null>[] = ['SN', 'CJ', 'FS', 'BS'];

/** Retourne les objectifs applicables pour un mouvement donné (RG12). */
export function goalsForMovement(movement: Movement): readonly ProtocoleGoal[] {
  return GOALS_BY_MOVEMENT[movement];
}
