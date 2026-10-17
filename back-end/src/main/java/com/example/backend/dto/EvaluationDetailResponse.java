package com.example.backend.dto;

import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.PsychoStrength;
import com.example.backend.enums.PsychoWeakness;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;

import java.time.LocalDate;
import java.util.List;

/**
 * Représentation complète d'une évaluation (bilan synthétique + détail des
 * mesures), destinée à la relecture et à la pré-saisie du wizard en édition.
 */
public record EvaluationDetailResponse(
        Integer evaluationId,
        Integer athleteId,
        LocalDate evaluationDate,
        Archetype archetype,
        StrengthSpeed strengthSpeed,
        Technique technique,
        Endurance endurance,
        StrengthSpeed squat,
        StrengthSpeed pull,
        Integer musculation,
        String snatchStrength,
        String snatchWeakness,
        String cleanStrength,
        String cleanWeakness,
        String jerkStrength,
        String jerkWeakness,
        PsychoStrength psychoStrength,
        PsychoWeakness psychoWeakness,
        List<EvalDetailResponse> details
) {
}
