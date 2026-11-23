package com.example.backend.dto;

import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Synthese (profil) saisie ou pre-remplie lors de la generation d'un programme.
 *
 * <p>Champs obligatoires : archetype, strengthSpeed, technique, endurance, squat, pull.
 * Champs optionnels : musculation (bitmask 0..15, nul traite comme 0) et points faibles
 * techniques snatch / clean / jerk ({@code EXT|CATCH|PATH} ou nul).
 * Aucun champ de psychologie ni de choix du mouvement "complex".</p>
 */
public record ProgrammeProfileRequest(
        @NotNull Archetype archetype,
        @NotNull StrengthSpeed strengthSpeed,
        @NotNull Technique technique,
        @NotNull Endurance endurance,
        @NotNull StrengthSpeed squat,
        @NotNull StrengthSpeed pull,
        @Min(0) @Max(15) Integer musculation,
        @Pattern(regexp = "EXT|CATCH|PATH") String snatch,
        @Pattern(regexp = "EXT|CATCH|PATH") String clean,
        @Pattern(regexp = "EXT|CATCH|PATH") String jerk
) {
}
