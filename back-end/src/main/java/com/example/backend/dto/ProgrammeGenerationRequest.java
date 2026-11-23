package com.example.backend.dto;

import java.time.LocalDate;

/**
 * Parametres internes de generation d'un programme, rattaches a une evaluation deja resolue.
 *
 * <p>Utilise par le moteur de generation, la creation et l'actualisation. Non expose par l'API
 * (la validation d'entree est portee par {@link ProgrammeCreateRequest}).</p>
 */
public record ProgrammeGenerationRequest(
        Integer evaluationId,
        Integer weeks,
        Integer frequency,
        Integer duration,
        LocalDate startDate,
        Integer snatchGoal,
        Integer cjGoal
) {
}
