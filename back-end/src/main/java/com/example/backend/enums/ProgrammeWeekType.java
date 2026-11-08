package com.example.backend.enums;

/**
 * Type de semaine d'un programme d'entraînement (colonne {@code week_type} de
 * {@code programme_weeks}).
 *
 * <p>Contrairement à {@link WeekTypeRef} (domaine {@code F | T | S | A | D} des
 * exercices de référence), ce domaine inclut la semaine de pré-compétition
 * {@code PC} : F (Foncier) | T (Technique) | S (Surcharge) | A (Affûtage) |
 * D (Deload) | PC (Pré-Compétition).</p>
 */
public enum ProgrammeWeekType {
    F,
    T,
    S,
    A,
    D,
    PC
}
