package com.example.backend.dto;

import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.PsychoStrength;
import com.example.backend.enums.PsychoWeakness;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * Payload de création d'une évaluation : le bilan synthétique
 * ({@code eval_summaries}) et le détail des mesures ({@code eval_details}).
 *
 * <p>Seuls l'athlète évalué et la date sont obligatoires ; les profils du bilan
 * peuvent être ajustés ou laissés vides par le coach. {@code musculation} est un
 * bitmask (0 si aucune orientation cochée).</p>
 */
public record EvaluationRequest(
        @NotNull Integer athleteId,
        @NotNull LocalDate evaluationDate,
        Archetype archetype,
        StrengthSpeed strengthSpeed,
        Technique technique,
        Endurance endurance,
        StrengthSpeed squat,
        StrengthSpeed pull,
        Integer musculation,
        @Size(max = 100) String snatchStrength,
        @Size(max = 100) String snatchWeakness,
        @Size(max = 100) String cleanStrength,
        @Size(max = 100) String cleanWeakness,
        @Size(max = 100) String jerkStrength,
        @Size(max = 100) String jerkWeakness,
        PsychoStrength psychoStrength,
        PsychoWeakness psychoWeakness,
        @Valid List<EvalDetailRequest> details
) {
}
