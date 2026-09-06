package com.example.backend.dto;

import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import jakarta.validation.constraints.NotNull;

/**
 * Payload de création / modification d'un archétype de référence.
 * Tous les champs sont obligatoires : la combinaison de profils détermine l'archétype.
 */
public record RefArchetypeRequest(
        @NotNull Archetype archetype,
        @NotNull StrengthSpeed strengthSpeed,
        @NotNull Technique technique,
        @NotNull Endurance endurance
) {
}
