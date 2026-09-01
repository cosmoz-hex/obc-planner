package com.example.backend.dto;

import com.example.backend.enums.AgeCategorie;
import com.example.backend.enums.CompLevel;
import com.example.backend.enums.Sexe;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload de création / modification d'un athlète.
 * Tous les champs sont obligatoires (règle fonctionnelle product.md).
 */
public record AthleteRequest(
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName,
        @NotNull Sexe sexe,
        @NotNull AgeCategorie ageCategorie,
        @NotNull Integer weightCategorie,
        @NotNull CompLevel compLevel
) {
}
