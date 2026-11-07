package com.example.backend.dto;

import com.example.backend.enums.Archetype;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Jeu de séries de référence d'un {@link RefExerciceRequest}, rattaché à un archétype.
 *
 * <p>{@code setNumber} est obligatoire ; {@code repNumber} (texte libre : {@code 6},
 * {@code 30s}, {@code 1 + 1}) et {@code weight} (pourcentage de l'exercice de
 * référence) sont nullables — notamment pour la musculation (pas de charge).</p>
 */
public record RefExerciceSetRequest(
        @NotNull Archetype archetype,
        @NotNull Integer setNumber,
        @Size(max = 20) String repNumber,
        BigDecimal weight
) {
}
