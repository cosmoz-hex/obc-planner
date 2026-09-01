package com.example.backend.dto;

import com.example.backend.enums.AgeCategorie;
import com.example.backend.enums.CompLevel;
import com.example.backend.enums.Sexe;

import java.time.LocalDate;

/**
 * Représentation d'un athlète renvoyée au frontend.
 * {@code lastEvaluationDate} est un champ dérivé (MAX evaluation_date de eval_summaries),
 * {@code null} si l'athlète n'a jamais été évalué.
 */
public record AthleteResponse(
        Integer athleteId,
        String firstName,
        String lastName,
        Sexe sexe,
        AgeCategorie ageCategorie,
        Integer weightCategorie,
        CompLevel compLevel,
        LocalDate lastEvaluationDate
) {
}
