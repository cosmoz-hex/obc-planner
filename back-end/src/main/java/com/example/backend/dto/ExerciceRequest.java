package com.example.backend.dto;

import com.example.backend.enums.CategorieExercice;
import com.example.backend.enums.TypeExercice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Payload de création / modification d'un exercice de référence.
 *
 * <p>Le type, la catégorie et le code sont obligatoires. L'exercice de référence
 * ({@code exerciceRef}) et la charge estimée ({@code estimateValue}) sont
 * facultatifs.</p>
 */
public record ExerciceRequest(
        @NotNull TypeExercice typeExercice,
        @NotNull CategorieExercice categorieExercice,
        @NotBlank @Size(max = 50) String exerciceCode,
        Integer exerciceRef,
        BigDecimal estimateValue
) {
}
