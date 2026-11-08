package com.example.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Payload de création d'un programme d'entraînement (génération).
 *
 * <p>La date de fin n'est pas reçue : elle est recalculée côté serveur
 * ({@code startDate + weeks * 7 - 1}). Les bornes reproduisent les domaines
 * fonctionnels : {@code weeks} ∈ {8, 12, 16}, {@code frequency} ∈ {3, 4, 5},
 * {@code duration} (optionnelle) ∈ {90, 120, 150}.</p>
 */
public record ProgrammeCreateRequest(
        @NotNull Integer evaluationId,
        @NotNull @Min(8) @Max(16) Integer weeks,
        @NotNull @Min(3) @Max(5) Integer frequency,
        @Min(90) @Max(150) Integer duration,
        @NotNull LocalDate startDate,
        @NotNull @Min(1) Integer snatchGoal,
        @NotNull @Min(1) Integer cjGoal
) {
}
