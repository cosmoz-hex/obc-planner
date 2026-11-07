package com.example.backend.dto;

import com.example.backend.enums.Archetype;

import java.math.BigDecimal;

/**
 * Représentation d'un jeu de séries de référence renvoyée au frontend.
 */
public record RefExerciceSetResponse(
        Integer refExerciceSetId,
        Archetype archetype,
        Integer setNumber,
        String repNumber,
        BigDecimal weight
) {
}
