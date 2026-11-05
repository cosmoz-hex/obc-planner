import {EvalDetail} from '../../../../models/eval-detail.model';

/**
 * Catégorie technique analysée par mouvement : Extension, Passage/Réception,
 * Trajectoire. Valeurs alignées sur les codes de point faible stockés dans
 * `eval_summaries` (`snatch`/`clean`/`jerk`) et sur les options de la synthèse.
 */
export type WeaknessCategory = 'EXT' | 'CATCH' | 'PATH';

/** Mouvement technique évalué. */
export type TechniqueMovement = 'snatch' | 'clean' | 'jerk';

/**
 * Entrée du mapping catégorie → exercices : code d'exercice (= clé i18n, qui est
 * aussi `EvalDetail.exerciceCode`) et drapeau d'inversion du ratio (RG2 :
 * `ratio_inverse = 2 − ratio`). Un même exercice peut apparaître dans plusieurs
 * catégories, parfois en normal, parfois en inverse (RG8).
 */
interface WeaknessEntry {
  code: string;
  inverse: boolean;
}

/**
 * Mapping exercice → mouvement → catégorie → (normal | inverse), transcrit
 * depuis `design.md` §3. Le mapping est codé **par clé i18n** (`exercice.*`), car
 * `exerciceCode` EST cette clé (cf. {@link EvalDetail.exerciceCode}).
 */
const MAPPING: Record<TechniqueMovement, Record<WeaknessCategory, readonly WeaknessEntry[]>> = {
  snatch: {
    EXT: [
      {code: 'exercice.snatch.heavy.power', inverse: false},
      {code: 'exercice.snatch.heavy.hang', inverse: false},
      {code: 'exercice.snatch.heavy.block', inverse: false}
    ],
    CATCH: [
      {code: 'exercice.snatch.heavy.balance', inverse: false},
      {code: 'exercice.snatch.light.tall', inverse: false},
      {code: 'exercice.snatch.heavy.power', inverse: true}
    ],
    PATH: [
      {code: 'exercice.snatch.heavy.no-feet', inverse: false},
      {code: 'exercice.snatch.light.muscle', inverse: false},
      {code: 'exercice.snatch.heavy.pause', inverse: false}
    ]
  },
  clean: {
    EXT: [
      {code: 'exercice.clean.heavy.power', inverse: false},
      {code: 'exercice.clean.heavy.hang', inverse: false},
      {code: 'exercice.clean.heavy.block', inverse: false}
    ],
    CATCH: [
      {code: 'exercice.clean.heavy.hip', inverse: false},
      {code: 'exercice.clean.light.tall', inverse: false},
      {code: 'exercice.clean.heavy.power', inverse: true}
    ],
    PATH: [
      {code: 'exercice.clean.heavy.no-feet', inverse: false},
      {code: 'exercice.clean.light.muscle', inverse: false},
      {code: 'exercice.clean.light.tall', inverse: false}
    ]
  },
  jerk: {
    EXT: [
      {code: 'exercice.jerk.heavy.power', inverse: false},
      {code: 'exercice.jerk.heavy.pause', inverse: false}
    ],
    CATCH: [
      {code: 'exercice.jerk.light.drop', inverse: false},
      {code: 'exercice.jerk.heavy.power', inverse: true}
    ],
    PATH: [
      {code: 'exercice.jerk.heavy.pause', inverse: false},
      {code: 'exercice.jerk.light.muscle', inverse: false}
    ]
  }
};

/**
 * Ordre de départage en cas d'égalité de moyenne (RG7) : la première catégorie
 * citée l'emporte. Identique pour les trois mouvements : `PATH` > `EXT` > `CATCH`.
 */
const TIEBREAK: Record<TechniqueMovement, readonly WeaknessCategory[]> = {
  snatch: ['PATH', 'EXT', 'CATCH'],
  clean: ['PATH', 'EXT', 'CATCH'],
  jerk: ['PATH', 'EXT', 'CATCH']
};

/** Catégorie neutre (aucun exercice renseigné) : 100 % (RG4). */
const EMPTY_CATEGORY_AVERAGE = 1;

/**
 * Moyenne des ratios `realValue / expected` des exercices d'une catégorie ayant
 * une valeur réalisée (RG3).
 *
 * - Exercice sans valeur réalisée → exclu (RG5).
 * - Exercice renseigné dont `expected` est `null` ou `0` → exclu (RG1/H1,
 *   garde-fou division par zéro).
 * - Exercice marqué « inverse » → `ratio_inverse = 2 − ratio` (RG2).
 * - Aucun exercice renseigné → 100 % (RG4).
 */
function categoryAverage(
  entries: readonly WeaknessEntry[],
  details: readonly EvalDetail[],
  expectedByCode: ReadonlyMap<string, number | null>
): number {
  const ratios: number[] = [];
  for (const entry of entries) {
    const real = details.find((d) => d.exerciceCode === entry.code)?.realValue ?? null;
    const expected = expectedByCode.get(entry.code) ?? null;
    if (real == null || expected == null || expected === 0) {
      continue;
    }
    const ratio = real / expected;
    ratios.push(entry.inverse ? 2 - ratio : ratio);
  }
  if (ratios.length === 0) {
    return EMPTY_CATEGORY_AVERAGE;
  }
  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
}

/**
 * Détermine la catégorie technique la plus déficitaire d'un mouvement (RG6), à
 * présélectionner comme point faible.
 *
 * Calcule la moyenne des ratios de chaque catégorie (EXT / CATCH / PATH) puis
 * retient celle de moyenne minimale ; en cas d'égalité, applique l'ordre de
 * priorité {@link TIEBREAK} (RG7).
 *
 * Renvoie `null` tant qu'aucune mesure n'est exploitable (aucune valeur réalisée
 * et aucun attendu) : pas de présélection avant la saisie.
 */
export function weakestCategory(
  movement: TechniqueMovement,
  details: readonly EvalDetail[],
  expectedByCode: ReadonlyMap<string, number | null>
): WeaknessCategory | null {
  const hasMeasure = details.some((d) => d.realValue != null);
  if (!hasMeasure && expectedByCode.size === 0) {
    return null;
  }

  const mapping = MAPPING[movement];
  const averages: Record<WeaknessCategory, number> = {
    EXT: categoryAverage(mapping.EXT, details, expectedByCode),
    CATCH: categoryAverage(mapping.CATCH, details, expectedByCode),
    PATH: categoryAverage(mapping.PATH, details, expectedByCode)
  };

  const min = Math.min(averages.EXT, averages.CATCH, averages.PATH);
  return TIEBREAK[movement].find((category) => averages[category] === min) ?? null;
}
