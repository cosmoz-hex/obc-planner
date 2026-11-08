package com.example.backend.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Série d'un exercice d'une case éditée d'un programme, imbriquée dans un
 * {@link CellExerciceRequest}.
 *
 * <p>{@code programmeSeriesId} est {@code null} pour une nouvelle série et
 * renseigné pour une série existante à mettre à jour. {@code setNumber},
 * {@code repNumber} (texte libre), {@code minWeight} et {@code maxWeight} sont
 * nullables.</p>
 */
public record CellSeriesRequest(
        Integer programmeSeriesId,
        Integer setNumber,
        @Size(max = 50) String repNumber,
        BigDecimal minWeight,
        BigDecimal maxWeight
) {
}
