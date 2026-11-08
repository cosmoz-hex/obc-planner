package com.example.backend.dto;

import java.util.List;

/**
 * Représentation d'une séance planifiée d'une semaine de programme renvoyée au
 * frontend.
 *
 * <p>Identifiée par son {@code trainingNumber} (1 à 5), elle porte la liste
 * imbriquée de ses exercices planifiés.</p>
 */
public record ProgrammeTrainingResponse(
        Integer programmeTrainingId,
        Integer trainingNumber,
        List<ProgrammeExerciceResponse> exercices
) {
}
