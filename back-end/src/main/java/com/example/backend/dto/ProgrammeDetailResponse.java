package com.example.backend.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Représentation complète d'un programme (en-tête + semaines imbriquées)
 * renvoyée au frontend pour la consultation / l'édition.
 *
 * <p>Le nom de l'athlète est aplati. La liste des semaines est nommée
 * {@code programmeWeeks} pour éviter le doublon avec le champ scalaire
 * {@code weeks} (nombre de semaines).</p>
 */
public record ProgrammeDetailResponse(
        Integer programmeId,
        Integer evaluationId,
        String athleteFirstName,
        String athleteLastName,
        Integer weeks,
        Integer frequency,
        Integer duration,
        LocalDate startDate,
        LocalDate endDate,
        Integer snatchGoal,
        Integer cjGoal,
        List<ProgrammeWeekResponse> programmeWeeks
) {
}
