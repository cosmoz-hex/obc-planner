package com.example.backend.utils;

import com.example.backend.enums.RefReference;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;

/**
 * Calcul des cibles de charge d'un programme (RG3, RG4, RG10).
 *
 * <p>Deux niveaux de cibles par mouvement de référence ({@link RefReference}) :</p>
 * <ul>
 *   <li><b>cibles finales</b> : dérivées des objectifs Arraché (SN) et
 *   Épaulé-Jeté (CJ) saisis, via des coefficients constants. Elles sont
 *   conservées <b>non arrondies</b> ({@code double}) — aucun arrondi
 *   intermédiaire sur la cible finale ;</li>
 *   <li><b>objectifs de semaine</b> : cible finale pondérée par le
 *   {@code base_percent} de la semaine.</li>
 * </ul>
 *
 * <p><b>Calcul en une seule passe</b> (RG10) : la cible finale reste non
 * arrondie et le {@code base_percent} est appliqué directement dessus. On en
 * dérive deux valeurs à partir de la <em>même</em> cible finale non arrondie :</p>
 * <ul>
 *   <li>l'objectif de semaine <em>stocké</em> dans {@code programme_weeks}
 *   ({@link #weekGoal}) = <b>round unique</b> de {@code cibleFinale × bp / 100}
 *   (aucun double arrondi) ;</li>
 *   <li>la base de calcul des <em>charges</em> d'un set ({@link #weekBase}) =
 *   cette même valeur <b>non arrondie</b> (le {@code base_percent} est déjà
 *   intégré — ne pas le réappliquer).</li>
 * </ul>
 *
 * <p>Exemple SN=90, base 96 % → base de charge 86.4 (non arrondie), objectif
 * stocké round(86.4) = 86. Set à 80 % → raw = 86.4 × 0.80 = 69.12 → max = 69,
 * min = floor(69.12 × 0.95) = floor(65.664) = 65. Exemple FS (dérivé de CJ=120)
 * : cible finale 120 × 1.14 = 136.8 (non arrondie) → objectif stocké
 * round(136.8 × 0.96) = round(131.328) = 131 (et non 132, qui résultait de
 * l'ancien double arrondi round(round(136.8) × 0.96)).</p>
 */
@Component
public class ProgrammeChargeCalculator {

    private static final double BACK_SQUAT_COEF = 1.35;   // BS = 135 % de l'EPJ
    private static final double FRONT_SQUAT_COEF = 1.14;  // FS = 114 % de l'EPJ
    private static final double SNATCH_PULL_COEF = 1.20;  // SP = 120 % de l'Arraché
    private static final double CLEAN_PULL_COEF = 1.30;   // CP = 130 % de l'EPJ

    private static final double MIN_RATIO = 0.95;

    /**
     * Cibles finales <b>non arrondies</b> par mouvement de référence à partir des
     * objectifs saisis. Les cibles dérivées (BS/FS/SP/CP) restent en
     * {@code double} : aucun arrondi intermédiaire n'est appliqué sur la cible
     * finale, afin que l'objectif de semaine et la base de charge dérivent de la
     * même valeur en une seule passe (RG10).
     *
     * @param snatchGoal objectif final Arraché (SN)
     * @param cjGoal     objectif final Épaulé-Jeté (CJ)
     */
    public Map<RefReference, Double> finalGoals(int snatchGoal, int cjGoal) {
        Map<RefReference, Double> goals = new EnumMap<>(RefReference.class);
        goals.put(RefReference.SN, (double) snatchGoal);
        goals.put(RefReference.CJ, (double) cjGoal);
        goals.put(RefReference.BS, cjGoal * BACK_SQUAT_COEF);
        goals.put(RefReference.FS, cjGoal * FRONT_SQUAT_COEF);
        goals.put(RefReference.SP, snatchGoal * SNATCH_PULL_COEF);
        goals.put(RefReference.CP, cjGoal * CLEAN_PULL_COEF);
        return goals;
    }

    /**
     * Objectif de semaine <b>arrondi</b> (valeur stockée / affichée) d'un
     * mouvement, en <b>un seul arrondi</b> appliqué à
     * {@code cibleFinale × basePercent / 100}. La cible finale fournie étant déjà
     * non arrondie, il n'y a aucun double arrondi.
     *
     * @param finalGoal   cible finale <b>non arrondie</b> du mouvement
     * @param basePercent pourcentage de base de la semaine
     */
    public int weekGoal(double finalGoal, int basePercent) {
        return (int) Math.round(finalGoal * basePercent / 100.0);
    }

    /**
     * Base de calcul de semaine <b>non arrondie</b> d'un mouvement (utilisée pour
     * les charges des sets). Dérive de la <em>même</em> cible finale non arrondie
     * que {@link #weekGoal} : aucun arrondi intermédiaire.
     *
     * @param finalGoal   cible finale <b>non arrondie</b> du mouvement
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
