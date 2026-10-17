package com.example.backend.dto;

import com.example.backend.enums.EvalCategorie;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Ligne de détail d'une évaluation (une mesure saisie dans le wizard).
 *
 * <p>{@code realValue} et {@code result} sont optionnels : certaines lignes de
 * référence n'ont pas de résultat qualitatif, et les blocs psychologiques
 * portent leur bitmask dans {@code realValue} sans {@code result}.</p>
 */
public record EvalDetailRequest(
        @NotNull EvalCategorie evalCategorie,
        @Size(max = 50) String exerciceCode,
        BigDecimal realValue,
        Integer result
) {
}
