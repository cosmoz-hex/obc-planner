import {Archetype, Endurance, StrengthSpeed, Technique} from '../../../../models/archetype.model';

/**
 * Combinaisons (force-vitesse / technique / endurance) → archétype, transcrites
 * depuis `.kiro/steering/product.md`.
 *
 * Correspondance de vocabulaire product.md → enums :
 * - force-vitesse : `force`→STRENGTH, `mixte`→MID, `vitesse`→SPEED
 * - technique     : `irrégulier`→LOW, `fiable`→MID, `spécialiste`→HIGH
 * - endurance     : `explosif`→LOW, `mixte`→MID, `endurant`→HIGH
 */
interface ArchetypeCombination {
  strengthSpeed: StrengthSpeed;
  technique: Technique;
  endurance: Endurance;
  archetype: Archetype;
}

const COMBINATIONS: readonly ArchetypeCombination[] = [
  // mixte
  {strengthSpeed: 'MID',      technique: 'MID',  endurance: 'MID', archetype: 'MID'},
  {strengthSpeed: 'MID',      technique: 'MID',  endurance: 'HIGH', archetype: 'MID'},
  {strengthSpeed: 'MID',      technique: 'LOW',  endurance: 'MID', archetype: 'MID'},
  {strengthSpeed: 'MID',      technique: 'HIGH', endurance: 'MID', archetype: 'MID'},
  {strengthSpeed: 'STRENGTH', technique: 'MID',  endurance: 'MID', archetype: 'MID'},
  {strengthSpeed: 'STRENGTH', technique: 'HIGH', endurance: 'MID', archetype: 'MID'},
  {strengthSpeed: 'SPEED',    technique: 'MID',  endurance: 'MID', archetype: 'MID'},
  {strengthSpeed: 'SPEED',    technique: 'HIGH', endurance: 'HIGH', archetype: 'MID'},

  // bourrin
  {strengthSpeed: 'STRENGTH', technique: 'MID',  endurance: 'HIGH', archetype: 'ROUGH'},
  {strengthSpeed: 'STRENGTH', technique: 'LOW',  endurance: 'MID', archetype: 'ROUGH'},
  {strengthSpeed: 'STRENGTH', technique: 'LOW',  endurance: 'HIGH', archetype: 'ROUGH'},
  {strengthSpeed: 'STRENGTH', technique: 'HIGH', endurance: 'HIGH', archetype: 'ROUGH'},

  // technicien
  {strengthSpeed: 'MID',      technique: 'HIGH', endurance: 'LOW', archetype: 'TECH'},
  {strengthSpeed: 'STRENGTH', technique: 'MID',  endurance: 'LOW', archetype: 'TECH'},
  {strengthSpeed: 'STRENGTH', technique: 'LOW',  endurance: 'LOW', archetype: 'TECH'},
  {strengthSpeed: 'STRENGTH', technique: 'HIGH', endurance: 'LOW', archetype: 'TECH'},
  {strengthSpeed: 'SPEED',    technique: 'LOW',  endurance: 'LOW', archetype: 'TECH'},
  {strengthSpeed: 'SPEED',    technique: 'HIGH', endurance: 'LOW', archetype: 'TECH'},

  // cyclique
  {strengthSpeed: 'MID',      technique: 'MID',  endurance: 'LOW', archetype: 'CYCLE'},
  {strengthSpeed: 'MID',      technique: 'LOW',  endurance: 'LOW', archetype: 'CYCLE'},
  {strengthSpeed: 'SPEED',    technique: 'MID',  endurance: 'LOW', archetype: 'CYCLE'},
  {strengthSpeed: 'SPEED',    technique: 'HIGH', endurance: 'MID', archetype: 'CYCLE'},

  // apprentissage
  {strengthSpeed: 'MID',      technique: 'LOW',  endurance: 'HIGH', archetype: 'LEARN'},
  {strengthSpeed: 'MID',      technique: 'HIGH', endurance: 'HIGH', archetype: 'LEARN'},
  {strengthSpeed: 'SPEED',    technique: 'MID',  endurance: 'HIGH', archetype: 'LEARN'},
  {strengthSpeed: 'SPEED',    technique: 'LOW',  endurance: 'MID', archetype: 'LEARN'},
  {strengthSpeed: 'SPEED',    technique: 'LOW',  endurance: 'HIGH', archetype: 'LEARN'}
];

/**
 * Détermine l'archétype pour une combinaison de profils. Renvoie `null` si la
 * combinaison n'est pas référencée (le coach complète alors manuellement).
 */
export function resolveArchetype(
  strengthSpeed: StrengthSpeed | null,
  technique: Technique | null,
  endurance: Endurance | null
): Archetype | null {
  if (strengthSpeed == null || technique == null || endurance == null) {
    return null;
  }
  const match = COMBINATIONS.find(
    (c) => c.strengthSpeed === strengthSpeed && c.technique === technique && c.endurance === endurance
  );
  return match?.archetype ?? null;
}
