package com.example.backend.dto;

import com.example.backend.enums.Archetype;
import com.example.backend.enums.Endurance;
import com.example.backend.enums.PsychoStrength;
import com.example.backend.enums.PsychoWeakness;
import com.example.backend.enums.StrengthSpeed;
import com.example.backend.enums.Technique;

import java.time.LocalDate;

/**
 * Représentation d'une évaluation renvoyée au frontend.
 *
 * <p>Les données de l'athlète évalué ({@code athleteId}, {@code firstName},
 * {@code lastName}) sont aplaties dans la réponse : elles proviennent d'une
 * jointure unique côté repository, sans requête additionnelle par ligne (aucun N+1).</p>
 */
public record EvaluationResponse(
        Integer evaluationId,
        Integer athleteId,
        String firstName,
        String lastName,
        LocalDate evaluationDate,
        Archetype archetype,
        StrengthSpeed strengthSpeed,
        Technique technique,
        Endurance endurance,
        PsychoStrength psychoStrength,
        PsychoWeakness psychoWeakness
) {
}
