package com.example.backend.dto;

import java.util.List;

/**
 * Représentation d'un exercice planifié d'une séance renvoyée au frontend.
 *
 * <p>Positionné par son {@code exerciceOrder} (plusieurs exercices au même ordre
 * = alternatives « au choix »), il porte la liste imbriquée de ses séries.</p>
 */
public record ProgrammeExerciceResponse(
        Integer programmeExerciceId,
        Integer exerciceOrder,
        String exerciceName,
        List<ProgrammeSeriesResponse> series
) {
}
