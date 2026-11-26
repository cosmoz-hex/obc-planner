/** Coefficients (en centièmes) des règles de calcul par défaut des objectifs squat / tirage. */
const BACK_SQUAT_COEF = 135;
const FRONT_SQUAT_COEF = 114;
const SNATCH_PULL_COEF = 120;
const CJ_PULL_COEF = 130;

/** Objectifs squat et tirage (kg entiers). */
export interface SquatPullGoals {
  readonly frontSquatGoal: number;
  readonly backSquatGoal: number;
  readonly snatchPullGoal: number;
  readonly cjPullGoal: number;
}

/** `round(valeur × coef / 100)`, `.5` arrondi vers le haut, en arithmétique entière (sans flottants). */
function scale(value: number, coefPercent: number): number {
  return Math.floor((value * coefPercent + 50) / 100);
}

function isValidGoal(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= 1;
}

/**
 * Objectifs squat / tirage proposés à partir de l'arraché et de l'épaulé-jeté.
 * Renvoie `null` si l'une des entrées est nulle, inférieure à 1 ou non finie.
 */
export function defaultSquatPullGoals(snatchGoal: number | null, cjGoal: number | null): SquatPullGoals | null {
  if (!isValidGoal(snatchGoal) || !isValidGoal(cjGoal)) {
    return null;
  }
  const snatch = Math.round(snatchGoal);
  const cj = Math.round(cjGoal);
  return {
    frontSquatGoal: scale(cj, FRONT_SQUAT_COEF),
    backSquatGoal: scale(cj, BACK_SQUAT_COEF),
    snatchPullGoal: scale(snatch, SNATCH_PULL_COEF),
    cjPullGoal: scale(cj, CJ_PULL_COEF)
  };
}
