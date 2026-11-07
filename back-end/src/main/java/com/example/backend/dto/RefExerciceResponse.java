package com.example.backend.dto;

import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.RefReference;
import com.example.backend.enums.WeekTypeRef;

import java.util.List;

/**
 * Représentation d'un exercice de référence et de ses séries (tous archétypes
 * confondus) renvoyée au frontend. Le front éclate la liste par archétype pour
 * produire une ligne par couple (exercice × archétype).
 */
public record RefExerciceResponse(
        Integer refExerciceId,
        ExerciceType exerciceType,
        WeekTypeRef weekType,
        RefGoal goal,
        Integer trainingOrder,
        String exerciceName,
        RefReference reference,
        List<RefExerciceSetResponse> sets
) {
}
