package com.example.backend.utils;

import com.example.backend.enums.RefGoal;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Conversion des orientations de musculation d'une évaluation (RG9).
 *
 * <p>Les orientations de musculation de l'évaluation sont encodées en bitmask
 * ({@code GENERAL=1, LEGS=2, POSTERIOR_CHAIN=4, UPPER_BODY=8}). Ce composant
 * expose la conversion de ce bitmask en liste ordonnée d'objectifs
 * {@link RefGoal} {@code [GEN?, LEGS?, POST?, UPPER?]}.</p>
 *
 * <p>Depuis la refonte du modèle Programme en 3 niveaux (séance → exercice →
 * série), la sélection des exercices de musculation d'une case est faite
 * directement par le moteur de génération, par ordre de case et alignée sur les
 * autres mouvements (plusieurs exercices alternatifs « au choix » au même ordre).
 * La file rotative « un exercice par semaine » n'est donc plus utilisée.</p>
 */
@Component
public class MusculationQueueBuilder {

    private static final int GENERAL = 1;
    private static final int LEGS = 2;
    private static final int POSTERIOR_CHAIN = 4;
    private static final int UPPER_BODY = 8;

    /**
     * Convertit le bitmask de musculation en liste ordonnée d'objectifs
     * {@code [GEN?, LEGS?, POST?, UPPER?]}. Vide (null ou 0) → {@code [GEN]}.
     */
    public List<RefGoal> bitmaskToGoals(Integer musculation) {
        int mask = musculation == null ? 0 : musculation;
        List<RefGoal> goals = new ArrayList<>();
        if ((mask & GENERAL) != 0) {
            goals.add(RefGoal.GEN);
        }
        if ((mask & LEGS) != 0) {
            goals.add(RefGoal.LEGS);
        }
        if ((mask & POSTERIOR_CHAIN) != 0) {
            goals.add(RefGoal.POST);
        }
        if ((mask & UPPER_BODY) != 0) {
            goals.add(RefGoal.UPPER);
        }
        if (goals.isEmpty()) {
            goals.add(RefGoal.GEN);
        }
        return goals;
    }
}
