package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Ligne (exercice planifié) d'une case éditée d'un programme, imbriquée dans un
 * {@link ProgrammeCellUpdateRequest}.
 *
 * <p>{@code programmeTrainingId} est {@code null} pour une nouvelle ligne et
 * renseigné pour une ligne existante à mettre à jour. {@code setNumber},
 * {@code repNumber} (texte libre), {@code repLabel}, {@code minWeight} et
 * {@code maxWeight} sont nullables.</p>
 */
public record CellLineRequest(
        Integer programmeTrainingId,
        @NotNull @Size(max = 100) String exerciceName,
        Integer setNumber,
        @Size(max = 20) String repNumber,
        @Size(max = 20) String repLabel,
        BigDecimal minWeight,
        BigDecimal maxWeight
) {
}
