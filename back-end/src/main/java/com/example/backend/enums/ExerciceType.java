package com.example.backend.enums;

/**
 * Type d'exercice des tables de référence de programmation (colonne
 * {@code exercice_type} de {@code ref_plannings} et {@code ref_exercices}).
 *
 * <p>Enum partagé : le domaine {@code ref_plannings} accepte
 * {@code SN | CJ | SQ | PL | RF | MS | PC} (contrainte {@code chk_ref_plannings_4}),
 * tandis que {@code ref_exercices} reste sur {@code SN | CJ | SQ | PL | RF | MS}
 * (contrainte {@code chk_ref_exercices_1}). La valeur {@code PC} n'est donc
 * valide à l'écriture que pour {@code ref_plannings}.</p>
 */
public enum ExerciceType {
    SN,
    CJ,
    SQ,
    PL,
    RF,
    MS,
    PC
}
