package com.example.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Exercice d'une case éditée d'un programme, imbriqué dans un
 * {@link ProgrammeCellUpdateRequest}.
 *
 * <p>{@code programmeExerciceId} est {@code null} pour un nouvel exercice et
 * renseigné pour un exercice existant à mettre à jour. {@code series} porte la
 * liste de ses séries (ajout/mise à jour/suppression en bloc).</p>
 */
public record CellExerciceRequest(
        Integer programmeExerciceId,
        @NotNull @Size(max = 255) String exerciceName,
        @Valid List<CellSeriesRequest> series
) {
}
