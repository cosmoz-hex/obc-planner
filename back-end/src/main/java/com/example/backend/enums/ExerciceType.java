package com.example.backend.enums;

/**
 * Type d'exercice des tables de référence de programmation (colonne
 * {@code exercice_type} de {@code ref_plannings} et {@code ref_exercices}).
 *
 * <p>Enum partagé : le domaine {@code ref_plannings} accepte
 * {@code SN | CJ | SQ | PL | RF | MS | PC} (contrainte {@code chk_ref_plannings_4}),
 * tandis que {@code ref_exercices} accepte
 * {@code SN | CJ | CL | JK | SQ | PL | RF | MS} (contrainte {@code chk_ref_exercices_1}).
 * {@code CJ} = Clean &amp; Jerk (épaulé-jeté complet) conservé ; {@code CL} = Clean
 * (épaulé) et {@code JK} = Jerk (jeté) distinguent les deux mouvements en cohérence
 * avec le wizard d'évaluation. La valeur {@code PC} n'est valide à l'écriture que
 * pour {@code ref_plannings}, et {@code CL} / {@code JK} que pour {@code ref_exercices}.</p>
 */
public enum ExerciceType {
    SN,
    CJ,
    CL,
    JK,
    SQ,
    PL,
    RF,
    MS,
    PC
}
