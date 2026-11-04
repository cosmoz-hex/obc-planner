package com.example.backend.enums;

/**
 * Type d'exercice des tables de référence de programmation (colonne
 * {@code exercice_type} de {@code ref_plannings} et {@code ref_exercices}),
 * aligné sur les contraintes {@code chk_ref_plannings_4} / {@code chk_ref_exercices_1}
 * (SN | CJ | SQ | PL | RF | MS).
 */
public enum ExerciceType {
    SN,
    CJ,
    SQ,
    PL,
    RF,
    MS
}
