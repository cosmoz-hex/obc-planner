package com.example.backend.utils;

import org.springframework.stereotype.Component;

/**
 * Calcul du pourcentage de base ({@code base_percent}) d'une semaine utile d'un
 * programme (RG2).
 *
 * <p>Une semaine « utile » est une semaine d'entraînement hors semaine de
 * pré-compétition finale. Pour {@code n} semaines utiles (= {@code weeks - 1}),
 * la semaine {@code i} (1-based) reçoit :</p>
 *
 * <pre>base_percent(i, n) = 100 - 2 * floorDiv(n - i, 3)</pre>
 *
 * <p>Progression par paliers de 3 semaines, de la première (la plus légère) à la
 * dernière semaine utile (100 %). La semaine de pré-compétition finale reçoit une
 * base fixe de {@value #PRE_COMPETITION_PERCENT} % (règle dédiée, hors de cette
 * formule).</p>
 *
 * <p>Tableaux reproduits exactement :</p>
 * <ul>
 *   <li>8 semaines (n=7) : 96 / 98 / 98 / 98 / 100 / 100 / 100</li>
 *   <li>12 semaines (n=11) : 94 / 94 / 96 / 96 / 96 / 98 / 98 / 98 / 100 / 100 / 100</li>
 *   <li>16 semaines (n=15) : 92×3 / 94×3 / 96×3 / 98×3 / 100×3</li>
 * </ul>
 */
@Component
public class WeekPercentCalculator {

    /** Base fixe de la semaine de pré-compétition (dernière semaine). */
    public static final int PRE_COMPETITION_PERCENT = 100;

    /**
     * Pourcentage de base d'une semaine utile.
     *
     * @param usefulWeek    numéro de la semaine utile, 1-based ({@code i})
     * @param usefulWeeks   nombre total de semaines utiles ({@code n = weeks - 1})
     * @return le pourcentage de base de la semaine
     */
    public int basePercent(int usefulWeek, int usefulWeeks) {
        return 100 - 2 * Math.floorDiv(usefulWeeks - usefulWeek, 3);
    }
}
