package com.example.backend.dto;

import java.math.BigDecimal;

/**
 * Représentation d'un exercice planifié (une ligne de la grille) renvoyée au
 * frontend.
 *
 * <p>{@code setNumber}, {@code repNumber} (texte libre), {@code repLabel},
 * {@code minWeight} et {@code maxWeight} sont nullables (renfo, pliométrie,
 * case « à définir » ou volume sans charge).</p>
 */
public record ProgrammeTrainingResponse(
        Integer programmeTrainingId,
        Integer trainingNumber,
        Integer exerciceOrder,
        String exerciceName,
        Integer setNumber,
        String repNumber,
        String repLabel,
        BigDecimal minWeight,
        BigDecimal maxWeight
) {
}
