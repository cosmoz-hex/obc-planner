package com.example.backend.dto;

import com.example.backend.enums.ExerciceType;
import com.example.backend.enums.RefGoal;
import com.example.backend.enums.RefReference;
import com.example.backend.enums.WeekTypeRef;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Payload de création / modification d'un exercice de référence et de ses séries.
 *
 * <p>Les séries ({@code sets}) sont imbriquées et portent chacune leur archétype.
 * {@code reference} est nullable (musculation sans référence de charge).</p>
 */
public record RefExerciceRequest(
        @NotNull ExerciceType exerciceType,
        @NotNull WeekTypeRef weekType,
        @NotNull RefGoal goal,
        @NotNull Integer trainingOrder,
        @NotNull @Size(max = 100) String exerciceName,
        RefReference reference,
        @Valid List<RefExerciceSetRequest> sets
) {
}
