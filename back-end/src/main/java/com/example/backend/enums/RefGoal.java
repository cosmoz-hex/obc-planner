package com.example.backend.enums;

/**
 * Objectif d'un exercice de référence (colonne {@code goal} de
 * {@code ref_exercices}), aligné sur la contrainte {@code chk_ref_exercices_3}
 * (EXT | CATCH | PATH | KEEP | STR | SPD | GEN | LEGS | POST | UPPER).
 *
 * <p>{@code EXT}, {@code CATCH}, {@code PATH} : objectifs techniques (Arraché /
 * Épaulé / Jeté). {@code KEEP}, {@code STR}, {@code SPD} : objectifs squat /
 * tirage. {@code GEN}, {@code LEGS}, {@code POST}, {@code UPPER} : objectifs
 * de musculation (Général / Jambes / Chaîne postérieure / Haut du corps).</p>
 */
public enum RefGoal {
    EXT,
    CATCH,
    PATH,
    KEEP,
    STR,
    SPD,
    GEN,
    LEGS,
    POST,
    UPPER
}
