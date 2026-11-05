package com.example.backend.dto;

import com.example.backend.enums.ExerciceType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Payload de création / modification d'une ligne de planning de référence.
 * Tous les champs sont obligatoires et bornés en cohérence avec les contraintes
 * CHECK de la table {@code ref_plannings}.
 */
public record RefPlanningRequest(
        @NotNull @Min(3) @Max(5) Integer weeksNumbers,
        @NotNull @Min(1) @Max(5) Integer trainingOrder,
        @NotNull @Min(1) @Max(6) Integer exerciceOrder,
        @NotNull ExerciceType exerciceType
) {
}
