package com.example.backend.dto;

import java.time.LocalDate;

/**
 * Ligne de liste d'un programme d'entraînement renvoyée au frontend.
 *
 * <p>Le nom de l'athlète ({@code athleteFirstName}, {@code athleteLastName}) est
 * aplati : il provient d'une jointure unique côté repository
 * ({@code eval_summaries → athletes}), sans requête additionnelle par ligne
 * (aucun N+1). Utilisé comme cible de projection DTO (colonnes aliasées).</p>
 */
public record ProgrammeResponse(
        Integer programmeId,
        String athleteFirstName,
        String athleteLastName,
        LocalDate startDate,
        Integer weeks,
        Integer frequency,
        Integer snatchGoal,
        Integer cjGoal
) {
}
