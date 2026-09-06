/** Valeurs possibles alignées sur les enums backend / contraintes BD. */
export type Archetype = 'MID' | 'ROUGH' | 'TECH' | 'CYCLE' | 'LEARN';
export type StrengthSpeed = 'STRENGTH' | 'MID' | 'SPEED';
export type Technique = 'LOW' | 'MID' | 'HIGH';
export type Endurance = 'LOW' | 'MID' | 'HIGH';

export const ARCHETYPES: readonly Archetype[] = ['MID', 'ROUGH', 'TECH', 'CYCLE', 'LEARN'];
export const STRENGTH_SPEEDS: readonly StrengthSpeed[] = ['STRENGTH', 'MID', 'SPEED'];
export const TECHNIQUES: readonly Technique[] = ['LOW', 'MID', 'HIGH'];
export const ENDURANCES: readonly Endurance[] = ['LOW', 'MID', 'HIGH'];

/** Archétype de référence tel que renvoyé par l'API (RefArchetypeResponse). */
export interface RefArchetype {
  readonly refArchetypeId: number;
  readonly archetype: Archetype;
  readonly strengthSpeed: StrengthSpeed;
  readonly technique: Technique;
  readonly endurance: Endurance;
}

/** Payload de création / modification (RefArchetypeRequest). */
export interface RefArchetypeRequest {
  archetype: Archetype;
  strengthSpeed: StrengthSpeed;
  technique: Technique;
  endurance: Endurance;
}

/** Critères de recherche métier des archétypes (hors pagination/tri). */
export interface ArchetypeFilter {
  archetype: Archetype | null;
  strengthSpeed: StrengthSpeed | null;
  technique: Technique | null;
  endurance: Endurance | null;
}
