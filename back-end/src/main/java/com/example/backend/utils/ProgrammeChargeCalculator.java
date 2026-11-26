package com.example.backend.utils;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Calcul des charges d'un programme (RG3, RG4, RG10) à partir des cibles finales.
 *
 * <p>Les cibles finales par mouvement de référence ({@link com.example.backend.enums.RefReference})
 * sont <b>saisies à la création</b> du programme (et stockées dans {@code programmes}) : ce
 * calculateur ne les dérive plus par coefficients. Il en tire deux niveaux de valeurs :</p>
 * <ul>
 *   <li><b>objectifs de semaine</b> : cible finale pondérée par le
 *   {@code base_percent} de la semaine ;</li>
 *   <li><b>charges des séries</b> : base de semaine pondérée par le pourcentage de la série.</li>
 * </ul>
 *
 * <p><b>Arrondi</b> (RG10) : le {@code base_percent} est appliqué une seule fois sur la
 * cible finale. Deux valeurs en découlent :</p>
 * <ul>
 *   <li>l'objectif de semaine <em>stocké</em> dans {@code programme_weeks}
 *   ({@link #weekGoal}) = <b>arrondi unique</b> de {@code cibleFinale × bp / 100} ;</li>
 *   <li>la base de calcul des <em>charges</em> d'un set ({@link #weekBase}) = cette
 *   même valeur <b>non arrondie</b> (le {@code base_percent} est déjà intégré,
 *   ne pas le réappliquer).</li>
 * </ul>
 *
 * <p>Exemple SN=90, base 96 % → base de charge 86.4 (non arrondie), objectif
 * stocké round(86.4) = 86. Set à 80 % → raw = 86.4 × 0.80 = 69.12 → max = 69,
 * min = floor(69.12 × 0.95) = floor(65.664) = 65.</p>
 */
@Component
public class ProgrammeChargeCalculator {

    private static final double MIN_RATIO = 0.95;

    /**
     * Objectif de semaine <b>arrondi</b> (valeur stockée / affichée) d'un
     * mouvement, en <b>un seul arrondi</b> appliqué à
     * {@code cibleFinale × basePercent / 100}.
     *
     * @param finalGoal   cible finale du mouvement
     * @param basePercent pourcentage de base de la semaine
     */
    public int weekGoal(double finalGoal, int basePercent) {
        return (int) Math.round(finalGoal * basePercent / 100.0);
    }

    /**
     * Base de calcul de semaine <b>non arrondie</b> d'un mouvement (utilisée pour
     * les charges des sets). Dérive de la <em>même</em> cible finale que
     * {@link #weekGoal} : aucun arrondi intermédiaire.
     *
     * @param finalGoal   cible finale du mouvement
     * @param basePercent pourcentage de base de la semaine
     */
    public double weekBase(double finalGoal, int basePercent) {
        return finalGoal * basePercent / 100.0;
    }

    /**
     * Charge maximale d'un set : {@code round(weekBase * weight / 100)}.
     * Le {@code base_percent} est déjà intégré dans {@code weekBase}.
     *
     * @param weekBase   base de calcul non arrondie du mouvement de référence
     * @param weightPct  pourcentage de la série (colonne {@code weight})
     */
    public BigDecimal maxWeight(double weekBase, BigDecimal weightPct) {
        double raw = rawCharge(weekBase, weightPct);
        return BigDecimal.valueOf(Math.round(raw));
    }

    /**
     * Charge minimale d'un set : {@code floor(weekBase * weight / 100 * 0.95)},
     * calculée sur la valeur brute (avant arrondi de la charge maximale).
     *
     * @param weekBase   base de calcul non arrondie du mouvement de référence
     * @param weightPct  pourcentage de la série (colonne {@code weight})
     */
    public BigDecimal minWeight(double weekBase, BigDecimal weightPct) {
        double raw = rawCharge(weekBase, weightPct);
        return BigDecimal.valueOf((long) Math.floor(raw * MIN_RATIO));
    }

    private double rawCharge(double weekBase, BigDecimal weightPct) {
        return weekBase * weightPct.doubleValue() / 100.0;
    }
}
