package com.example.backend.dto;

import com.example.backend.enums.ExerciceType;

/**
 * Représentation d'une ligne de planning de référence renvoyée au frontend.
 */
public record RefPlanningResponse(
        Integer refPlanningId,
        Integer weeksNumbers,
        Integer trainingOrder,
        Integer exerciceOrder,
        ExerciceType exerciceType
) {
}
