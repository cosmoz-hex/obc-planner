package com.example.backend.dto;

import java.math.BigDecimal;

/**
 * Représentation d'une série planifiée d'un exercice renvoyée au frontend.
 *
 * <p>{@code setNumber}, {@code repNumber} (texte libre), {@code minWeight} et
 * {@code maxWeight} sont nullables (renfo, pliométrie, case « à définir » ou
 * volume sans charge).</p>
 */
public record ProgrammeSeriesResponse(
        Integer programmeSeriesId,
        Integer setNumber,
        String repNumber,
        BigDecimal minWeight,
        BigDecimal maxWeight
) {
}
