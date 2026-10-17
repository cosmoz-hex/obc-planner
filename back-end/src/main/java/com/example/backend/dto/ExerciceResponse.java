package com.example.backend.dto;

import com.example.backend.enums.CategorieExercice;
import com.example.backend.enums.TypeExercice;

import java.math.BigDecimal;

/**
 * Représentation d'un exercice de référence renvoyée par l'API.
 *
 * <p>{@code exerciceRef} porte l'identifiant de l'exercice de référence (ou
 * {@code null} pour un exercice racine), sans charger l'entité associée.</p>
 */
public record ExerciceResponse(
        Integer exerciceId,
        Integer exerciceRef,
        TypeExercice typeExercice,
        CategorieExercice categorieExercice,
        String exerciceCode,
        BigDecimal estimateValue
) {
}
