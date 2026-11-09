package com.example.backend.enums;

/**
 * Objectif d'un exercice de référence (colonne {@code goal} de
 * {@code ref_exercices}), aligné sur la contrainte {@code chk_ref_exercices_3}
 * (EXT | CATCH | PATH | KEEP | STR | SPD | GEN | LEGS | POST | UPPER | les 9
 * objectifs de renfo spécifique composés ci-dessous).
 *
 * <p>{@code EXT}, {@code CATCH}, {@code PATH} : objectifs techniques (Arraché /
 * Épaulé / Jeté). {@code KEEP}, {@code STR}, {@code SPD} : objectifs squat /
 * tirage. {@code GEN}, {@code LEGS}, {@code POST}, {@code UPPER} : objectifs
 * de musculation (Général / Jambes / Chaîne postérieure / Haut du corps).</p>
 *
 * <p>Objectifs de <b>renfo spécifique</b> (cases {@code RF}) : codes composés
 * {@code {mouvement}_{objectif technique}} où le mouvement est {@code SN}
 * (Arraché), {@code CL} (Épaulé) ou {@code JK} (Jeté), et l'objectif technique
 * {@code EXT} / {@code CATCH} / {@code PATH}. Soit {@code SN_EXT}, {@code SN_CATCH},
 * {@code SN_PATH}, {@code CL_EXT}, {@code CL_CATCH}, {@code CL_PATH}, {@code JK_EXT},
 * {@code JK_CATCH}, {@code JK_PATH}.</p>
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
    UPPER,
    SN_EXT,
    SN_CATCH,
    SN_PATH,
    CL_EXT,
    CL_CATCH,
    CL_PATH,
    JK_EXT,
    JK_CATCH,
    JK_PATH
}
